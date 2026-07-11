import type { ICuenta } from '../interfaces/I_vCuenta';
import type { IMovimiento } from '../interfaces/I_vMovimiento';

export default class Cl_mCuenta implements ICuenta {
    private _saldoTotal: number = 0;
    private _movimientos: IMovimiento[] = [];

    constructor(saldoInicial: number = 0) {
        this._saldoTotal = saldoInicial;
    }

    agregarMovimiento(mov: IMovimiento): void {
        this._movimientos.push(mov);
        if (mov.tipo === 'Ingreso') {
            this._saldoTotal += mov.monto;
        } else {
            this._saldoTotal -= mov.monto;
        }
    }

    set saldoTotal(saldo: number) { this._saldoTotal = saldo; }
    get saldoTotal(): number { return this._saldoTotal; }

    set movimientos(movs: IMovimiento[]) { this._movimientos = movs; }
    get movimientos(): IMovimiento[] { return this._movimientos; }
}