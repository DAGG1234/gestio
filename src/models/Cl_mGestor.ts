import type { IGestor } from '../interfaces/I_vGestor';
import type { IMovimiento } from '../interfaces/I_vMovimiento';
import type { ICuenta } from '../interfaces/I_vCuenta';

export default class Cl_mGestor implements IGestor {
    private _cuenta: ICuenta;

    constructor(cuenta: ICuenta) {
        this._cuenta = cuenta;
    }

    set cuenta(cuenta: ICuenta) { this._cuenta = cuenta; }
    get cuenta(): ICuenta { return this._cuenta; }

    registrarOperacion(mov: IMovimiento): void {
        this._cuenta.agregarMovimiento(mov);
    }

    obtenerSaldo(): number {
        return this._cuenta.saldoTotal;
    }

    obtenerHistorial(): IMovimiento[] {
        return this._cuenta.movimientos;
    }

    obtenerTotalIngresos(): number {
        return this._cuenta.movimientos
            .filter(m => m.tipo === 'Ingreso')
            .reduce((sum, m) => sum + m.monto, 0);
    }

    obtenerTotalEgresos(): number {
        return this._cuenta.movimientos
            .filter(m => m.tipo === 'Egreso')
            .reduce((sum, m) => sum + m.monto, 0);
    }

    vaciarMovimientos(): void {
        this.cuenta.movimientos = [];
        this.cuenta.saldoTotal = 0;
}
}