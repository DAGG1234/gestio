export default class Cl_mGestor {
    _cuenta;
    constructor(cuenta) {
        this._cuenta = cuenta;
    }
    set cuenta(cuenta) { this._cuenta = cuenta; }
    get cuenta() { return this._cuenta; }
    registrarOperacion(mov) {
        this._cuenta.agregarMovimiento(mov);
    }
    obtenerSaldo() {
        return this._cuenta.saldoTotal;
    }
    obtenerHistorial() {
        return this._cuenta.movimientos;
    }
    obtenerTotalIngresos() {
        return this._cuenta.movimientos
            .filter(m => m.tipo === 'Ingreso')
            .reduce((sum, m) => sum + m.monto, 0);
    }
    obtenerTotalEgresos() {
        return this._cuenta.movimientos
            .filter(m => m.tipo === 'Egreso')
            .reduce((sum, m) => sum + m.monto, 0);
    }
    vaciarMovimientos() {
        this.cuenta.movimientos = [];
        this.cuenta.saldoTotal = 0;
    }
}
