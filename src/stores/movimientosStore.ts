import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';

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

    // 4. Acción de descarga (CORREGIDA)
    function descargarAuditoria() {
        const datos = historialFiltrado.value.map(item => ({
            "FECHA": new Date(item.fecha).toLocaleDateString(),
            "CATEGORÍA": item.categoria,
            "DESCRIPCIÓN": item.descripcion,
            "TIPO": item.tipo,
            "MONTO": item.monto
        }));

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [["Reporte Financiero - Gestio"], ["Fecha:", new Date().toLocaleDateString()]], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, datos, { origin: "A4" });
        worksheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 15 }];
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoria");
        XLSX.writeFile(workbook, "Reporte_Gestio.xlsx");
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
        descargarAuditoria // Ya está incluida para ser usada en tus vistas
    };
});