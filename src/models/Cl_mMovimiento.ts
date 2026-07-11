import type { IMovimiento } from '../interfaces/I_vMovimiento';

export default class Cl_mMovimiento implements IMovimiento {
    private _id: string = "";
    private _tipo: 'Ingreso' | 'Egreso' = 'Ingreso';
    private _categoria: string = "";
    private _descripcion: string = ""
    private _monto: number = 0;
    private _fecha: string = "";

    constructor(
        id: string, // Para identificar el movimiento
        tipo: 'Ingreso' | 'Egreso', // Define si suma o resta
        categoria: string, // Para el "Historial más complejo"
        descripcion: string,
        monto: number,
        fecha: string // Para el diario cronológico
    ) {
        this.id = id;
        this.tipo = tipo;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.monto = monto;
        this.fecha = fecha;
    }

    set id(id: string) {
        this._id = id;
    }
    get id(): string {
        return this._id;
    }

    set tipo(tipo: 'Ingreso' | 'Egreso') {
        this._tipo = tipo;
    }
    get tipo(): 'Ingreso' | 'Egreso' {
        return this._tipo;
    }

    set categoria(categoria: string) {
        this._categoria = categoria;
    }
    get categoria(): string {
        return this._categoria;
    }
    set descripcion(descripcion: string) {
        this._descripcion = descripcion;
    }
    get descripcion(): string {
        return this._descripcion;
    }
    set monto(monto: number) {
        this._monto = monto;
    }
    get monto(): number {
        return this._monto;
    }
    set fecha(fecha: string) {
        this._fecha = fecha;
    }
    get fecha(): string {
        return this._fecha;
    }
}