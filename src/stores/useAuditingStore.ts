// src/stores/useAuditingStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFinanceStore } from './useFinanceStore'
import { useCurrencyToggle } from './useCurrencyToggle'
import ExcelJS from 'exceljs'

export const useAuditingStore = defineStore('auditing', () => {
  const financeStore = useFinanceStore()
  const currencyStore = useCurrencyToggle()

  // Ciclo temporal por defecto: mes y año actual
  const currentDate = new Date()
  const selectedMonth = ref<number>(currentDate.getMonth()) // 0-11
  const selectedYear = ref<number>(currentDate.getFullYear())
  
  // Filtros globales de gráfica y tabla
  const chartMetricFilter = ref<'all' | 'income' | 'expense'>('all')
  const searchQuery = ref<string>('')

  // Asegurar la carga de datos desde Supabase si el store de finanzas está vacío
  const ensureDataLoaded = async () => {
    if (financeStore.transactions.length === 0 && typeof financeStore.fetchAllData === 'function') {
      await financeStore.fetchAllData()
    }
  }

  const availableYears = computed(() => {
    const years = new Set<number>()
    years.add(currentDate.getFullYear())
    financeStore.transactions.forEach(t => {
      years.add(new Date(t.date).getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  })

  const monthsList = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Transacciones base filtradas por el ciclo temporal y buscador de tabla
  const filteredTransactions = computed(() => {
    return financeStore.transactions.filter(t => {
      const d = new Date(t.date)
      const matchesDate = d.getUTCMonth() === selectedMonth.value && d.getUTCFullYear() === selectedYear.value
      const matchesSearch = searchQuery.value === '' || 
        t.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.value.toLowerCase())
      return matchesDate && matchesSearch
    })
  })

  // Transacciones filtradas específicamente por el selector de métrica de la gráfica
  const chartFilteredTransactions = computed(() => {
    return filteredTransactions.value.filter(t => {
      if (chartMetricFilter.value === 'income') return t.type === 'income'
      if (chartMetricFilter.value === 'expense') return t.type === 'expense'
      return true
    })
  })

  // KPIs Financieros del periodo
  const totalIncome = computed(() => {
    return filteredTransactions.value
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
  })

  const totalExpense = computed(() => {
    return filteredTransactions.value
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
  })

  const netSavings = computed(() => totalIncome.value - totalExpense.value)

  const savingsRate = computed(() => {
    if (totalIncome.value === 0) return 0
    return (netSavings.value / totalIncome.value) * 100
  })

  // Proyección de cierre de mes
  const projection = computed(() => {
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
    const today = new Date()
    const isCurrentPeriod = today.getMonth() === selectedMonth.value && today.getFullYear() === selectedYear.value
    const passedDays = isCurrentPeriod ? Math.max(today.getDate(), 1) : daysInMonth

    const dailyExpenseRate = totalExpense.value / passedDays
    const projectedTotalExpense = dailyExpenseRate * daysInMonth
    const spendingDeviation = projectedTotalExpense > totalIncome.value ? 'Alerta: Ritmo de gastos elevado' : 'Estable y saludable'

    return {
      projectedTotalExpense,
      spendingDeviation,
      isCurrentPeriod
    }
  })

  // Motor de Exportación Profesional con ExcelJS y sincronización Supabase
  const exportToExcel = async () => {
    await ensureDataLoaded()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Gestio App'
    workbook.created = new Date()

    // ==========================================
    // 1. PESTAÑA 1: RESUMEN EJECUTIVO
    // ==========================================
    const summarySheet = workbook.addWorksheet('Resumen Ejecutivo', {
      views: [{ showGridLines: true }]
    })

    // Título Principal
    summarySheet.mergeCells('A1:E1')
    const titleCell = summarySheet.getCell('A1')
    titleCell.value = `REPORTE FINANCIERO GESTIO - ${monthsList[selectedMonth.value].toUpperCase()} ${selectedYear.value}`
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0B4D6C' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    summarySheet.getRow(1).height = 35

    summarySheet.addRow([]) // Espacio

    // Subtítulo Sección 1
    summarySheet.mergeCells('A3:C3')
    const subTitle1 = summarySheet.getCell('A3')
    subTitle1.value = 'INDICADORES CLAVE DEL CICLO'
    subTitle1.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '0B4D6C' } }
    summarySheet.getRow(3).height = 22

    // Cabecera de KPIs
    const summaryHeaderRow = summarySheet.addRow(['Métrica / Indicador Financiero', `Valor (${currencyStore.currentCurrency})`, '', 'Estado del Ciclo', 'Evaluación'])
    summaryHeaderRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } }
    summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
    summaryHeaderRow.height = 24

    summaryHeaderRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '093D56' } }
    })

    const summaryData = [
      { label: 'Ciclo Evaluado', val: `${monthsList[selectedMonth.value]} ${selectedYear.value}`, isCurrency: false, status: 'Activo', eval: 'Completado' },
      { label: 'Ingresos Totales', val: totalIncome.value, isCurrency: true, status: 'Saludable', eval: 'Óptimo' },
      { label: 'Egresos Totales', val: totalExpense.value, isCurrency: true, status: 'Controlado', eval: 'Estable' },
      { label: 'Ahorro Neto', val: netSavings.value, isCurrency: true, status: 'Positivo', eval: 'Favorable' },
      { label: 'Tasa de Ahorro Real', val: `${savingsRate.value.toFixed(1)}%`, isCurrency: false, status: 'Rendimiento', eval: savingsRate.value > 20 ? 'Excelente' : 'Regular' },
      { label: 'Proyección Cierre de Gasto', val: projection.value.projectedTotalExpense, isCurrency: true, status: projection.value.spendingDeviation, eval: 'Monitoreo' }
    ]

    let currentRowIdx = 5
    summaryData.forEach((item, idx) => {
      const row = summarySheet.addRow([item.label, item.val, '', item.status, item.eval])
      row.font = { name: 'Segoe UI', size: 10 }
      row.height = 22

      const cellA = row.getCell(1)
      const cellB = row.getCell(2)
      const cellD = row.getCell(4)
      const cellE = row.getCell(5)

      cellA.alignment = { vertical: 'middle', horizontal: 'left' }
      cellB.alignment = { vertical: 'middle', horizontal: item.isCurrency ? 'right' : 'center' }
      cellD.alignment = { vertical: 'middle', horizontal: 'center' }
      cellE.alignment = { vertical: 'middle', horizontal: 'center' }

      if (item.isCurrency && typeof item.val === 'number') {
        cellB.numFmt = '"$"#,##0.00;[Red]("$"#,##0.00);"-"'
      }

      [cellA, cellB, row.getCell(3), cellD, cellE].forEach(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        }
        if (idx % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
        }
      })
      currentRowIdx++
    })

    // Espacio entre secciones en la Pestaña 1
    currentRowIdx += 2
    summarySheet.addRow([])
    summarySheet.addRow([])

    // Subtítulo Sección 2: Historial Integrado en Resumen
    const subTitle2Row = summarySheet.addRow(['HISTORIAL GENERAL DE INGRESOS Y EGRESOS DEL CICLO'])
    summarySheet.mergeCells(`A${currentRowIdx}:E${currentRowIdx}`)
    subTitle2Row.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '0B4D6C' } }
    currentRowIdx++

    // Cabecera del Historial en Resumen
    const historyHeaderRow = summarySheet.addRow(['Fecha', 'Tipo de Movimiento', 'Categoría', 'Descripción', `Monto (${currencyStore.currentCurrency})`])
    historyHeaderRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } }
    historyHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
    historyHeaderRow.height = 24

    historyHeaderRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '093D56' } }
    })
    currentRowIdx++

    // Insertar cada transacción con su fecha en el resumen
    filteredTransactions.value.forEach((t, index) => {
      const formattedDate = new Date(t.date).toLocaleDateString()
      const hRow = summarySheet.addRow([
        formattedDate,
        t.type === 'income' ? 'Ingreso' : 'Egreso',
        t.category,
        t.description,
        t.amount
      ])
      hRow.font = { name: 'Segoe UI', size: 9.5 }
      hRow.height = 20

      const cellDate = hRow.getCell(1)
      const cellType = hRow.getCell(2)
      const cellCat = hRow.getCell(3)
      const cellDesc = hRow.getCell(4)
      const cellAmount = hRow.getCell(5)

      cellDate.alignment = { vertical: 'middle', horizontal: 'center' }
      cellType.alignment = { vertical: 'middle', horizontal: 'center' }
      cellCat.alignment = { vertical: 'middle', horizontal: 'left' }
      cellDesc.alignment = { vertical: 'middle', horizontal: 'left' }
      cellAmount.alignment = { vertical: 'middle', horizontal: 'right' }

      cellAmount.numFmt = '"$"#,##0.00;[Red]("$"#,##0.00);"-"'

      if (t.type === 'income') {
        cellType.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '047857' } }
        cellAmount.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '047857' } }
      } else {
        cellType.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'BE123C' } }
        cellAmount.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'BE123C' } }
      }

      [cellDate, cellType, cellCat, cellDesc, cellAmount].forEach(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        }
        if (index % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
        }
      })
    })

    summarySheet.columns = [
      { width: 20 },
      { width: 22 },
      { width: 22 },
      { width: 38 },
      { width: 22 }
    ]

    // ==========================================
    // 2. PESTAÑA 2: HISTORIAL DETALLADO
    // ==========================================
    const detailSheet = workbook.addWorksheet('Historial Detallado', {
      views: [{ showGridLines: true }]
    })

    const detailHeaderRow = detailSheet.addRow(['Fecha', 'Tipo', 'Categoría', 'Descripción del Movimiento', `Monto (${currencyStore.currentCurrency})`])
    detailHeaderRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } }
    detailHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
    detailHeaderRow.height = 24

    detailHeaderRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0B4D6C' } }
    })

    filteredTransactions.value.forEach((t, index) => {
      const dRow = detailSheet.addRow([
        new Date(t.date).toLocaleDateString(),
        t.type === 'income' ? 'Ingreso' : 'Egreso',
        t.category,
        t.description,
        t.amount
      ])
      dRow.font = { name: 'Segoe UI', size: 9.5 }
      const amountCell = dRow.getCell(5)
      amountCell.numFmt = '"$"#,##0.00;[Red]("$"#,##0.00);"-"'
      amountCell.alignment = { horizontal: 'right' }

      if (index % 2 === 1) {
        dRow.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } })
      }
    })

    if (filteredTransactions.value.length > 0) {
      const totalRow = detailSheet.addRow(['TOTAL GENERAL', '', '', '', { formula: `SUM(E2:E${filteredTransactions.value.length + 1})` }])
      totalRow.font = { name: 'Segoe UI', size: 10, bold: true }
      const totalCell = totalRow.getCell(5)
      totalCell.numFmt = '"$"#,##0.00;[Red]("$"#,##0.00);"-"'
      totalCell.alignment = { horizontal: 'right' }
      totalRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: '0B4D6C' } },
          bottom: { style: 'double', color: { argb: '0B4D6C' } }
        }
      })
    }

    detailSheet.columns = [
      { width: 16 },
      { width: 14 },
      { width: 22 },
      { width: 42 },
      { width: 22 }
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Auditoria_Gestio_${monthsList[selectedMonth.value]}_${selectedYear.value}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  return {
    selectedMonth,
    selectedYear,
    availableYears,
    monthsList,
    filteredTransactions,
    chartFilteredTransactions,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    projection,
    chartMetricFilter,
    searchQuery,
    ensureDataLoaded,
    exportToExcel
  }
})