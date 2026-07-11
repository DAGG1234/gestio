import type { IMovimiento } from './I_vMovimiento';
import type { ICuenta } from './I_vCuenta';

export interface IGestor {
    cuenta: ICuenta;
    registrarOperacion(mov: IMovimiento): void;
    obtenerSaldo(): number;
    obtenerHistorial(): IMovimiento[];
    obtenerTotalIngresos(): number; // Asegúrate de tener esta
    obtenerTotalEgresos(): number;  // Asegúrate de tener esta
    vaciarMovimientos(): void;
}