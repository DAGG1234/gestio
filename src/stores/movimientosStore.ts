import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ExcelJS from 'exceljs';


export interface IMovimiento {
    id: number;
    tipo: 'Ingreso' | 'Egreso';
    categoria: string;
    descripcion: string;
    monto: number;
    fecha: string;
}

export const useMovimientosStore = defineStore('movimientos', () => {
    // 1. Estado base
    const saved = localStorage.getItem('gestio_historial');
    const historial = ref<IMovimiento[]>(saved ? JSON.parse(saved) : []);

    // 2. Estado de Filtro
    const filtroTipo = ref<'Todos' | 'Ingreso' | 'Egreso'>('Todos');

    function sincronizar() {
        localStorage.setItem('gestio_historial', JSON.stringify(historial.value));
    }

    function agregarMovimiento(mov: Omit<IMovimiento, 'id' | 'fecha'>) {
        historial.value.push({ ...mov, id: Date.now(), fecha: new Date().toISOString() });
        sincronizar();
    }

    function limpiarHistorial() {
        historial.value = [];
        sincronizar();
    }

    function establecerFiltro(tipo: 'Todos' | 'Ingreso' | 'Egreso') {
        filtroTipo.value = tipo;
    }

    // 3. Computados
    const totalIngresos = computed(() => historial.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresos = computed(() => historial.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));
    const saldo = computed(() => totalIngresos.value - totalEgresos.value);

    const historialFiltrado = computed(() => {
        if (filtroTipo.value === 'Todos') return historial.value;
        return historial.value.filter(m => m.tipo === filtroTipo.value);
    });



    // Ahora la función recibe los datos y totales que ya tienes filtrados en tu componente
    async function descargarAuditoria() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Auditoria', {
            views: [{ showGridLines: false }]
        });

        // 1. TÍTULO GESTIO (Equilibrado y Profesional)
        worksheet.mergeCells('A1:E2');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'REPORTE DE TUS MOVIMIENTOS GESTIO';
        titleCell.font = { size: 24, bold: true, color: { argb: 'FFFFFFFF' } }; // Tamaño 24 es el punto dulce
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0332FD' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Altura justa para que no se vea ni pequeño ni gigante
        worksheet.getRow(1).height = 40;
        worksheet.getRow(2).height = 40;

        // 2. ENCABEZADOS
        const headers = ['FECHA', 'CATEGORÍA', 'DESCRIPCIÓN', 'INGRESO', 'EGRESO'];
        const headerRow = worksheet.getRow(4);
        headerRow.values = headers;
        headerRow.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.height = 45;
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
        });

        // 3. DATOS
        historialFiltrado.value.forEach((item) => {
            const row = worksheet.addRow([
                new Date(item.fecha).toLocaleDateString('es-VE'),
                item.categoria,
                item.descripcion,
                item.tipo === 'Ingreso' ? item.monto : 0,
                item.tipo === 'Egreso' ? item.monto : 0
            ]);
            row.height = 35;
            row.font = { size: 12 };
            row.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // 4. TOTALES (Tarjetas Azules)
        const rowOffset = worksheet.rowCount + 4;
        const addTotal = (r: number, label: string, val: number) => {
            const row = worksheet.getRow(r);
            const cellLabel = row.getCell(4);
            const cellVal = row.getCell(5);

            cellLabel.value = label;
            cellVal.value = val;

            row.font = { bold: true, size: 14 };
            row.height = 40;

            // Estilo de etiqueta (Azul oscuro / Gris)
            cellLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
            cellLabel.font = { bold: true, color: { argb: 'FFFFFFFF' } };

            // Estilo de valor
            cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

            // Borde fino gris claro
            [cellLabel, cellVal].forEach(c => {
                c.border = {
                    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
                };
                c.alignment = { vertical: 'middle', horizontal: 'center' };
            });
        };

        addTotal(rowOffset, 'TOTAL INGRESOS', totalIngresos.value);
        addTotal(rowOffset + 1, 'TOTAL EGRESOS', totalEgresos.value);
        addTotal(rowOffset + 2, 'SALDO FINAL', saldo.value);

        // 5. ESTIRAMIENTO Y BORDES DE TABLA
        worksheet.columns = [
            { width: 25 }, { width: 30 }, { width: 80 }, { width: 25 }, { width: 25 }
        ];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber >= 4 && rowNumber < rowOffset) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
                    };
                });
            }
        });

        // 6. DESCARGA
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte_Financiero_Gestio.xlsx';
        a.click();
    }



    // EL RETURN DEBE IR AL FINAL DE LA FUNCIÓN PRINCIPAL
    return {
        historial,
        historialFiltrado,
        filtroTipo,
        totalIngresos,
        totalEgresos,
        saldo,
        agregarMovimiento,
        limpiarHistorial,
        establecerFiltro,
        descargarAuditoria
    };
});