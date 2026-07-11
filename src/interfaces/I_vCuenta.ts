import type { IMovimiento } from './I_vMovimiento';

export interface ICuenta {
    saldoTotal: number;
    movimientos: IMovimiento[];
    agregarMovimiento(mov: IMovimiento): void;
}