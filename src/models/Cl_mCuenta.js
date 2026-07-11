export default class Cl_mCuenta {
    _saldoTotal = 0;
    _movimientos = [];
    constructor(saldoInicial = 0) {
        this._saldoTotal = saldoInicial;
    }
    agregarMovimiento(mov) {
        this._movimientos.push(mov);
        if (mov.tipo === 'Ingreso') {
            this._saldoTotal += mov.monto;
        }
        else {
            this._saldoTotal -= mov.monto;
        }
    }
    set saldoTotal(saldo) { this._saldoTotal = saldo; }
    get saldoTotal() { return this._saldoTotal; }
    set movimientos(movs) { this._movimientos = movs; }
    get movimientos() { return this._movimientos; }
}
