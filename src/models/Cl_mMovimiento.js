export default class Cl_mMovimiento {
    _id = "";
    _tipo = 'Ingreso';
    _categoria = "";
    _descripcion = "";
    _monto = 0;
    _fecha = "";
    constructor(id, // Para identificar el movimiento
    tipo, // Define si suma o resta
    categoria, // Para el "Historial más complejo"
    descripcion, monto, fecha // Para el diario cronológico
    ) {
        this.id = id;
        this.tipo = tipo;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.monto = monto;
        this.fecha = fecha;
    }
    set id(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }
    set tipo(tipo) {
        this._tipo = tipo;
    }
    get tipo() {
        return this._tipo;
    }
    set categoria(categoria) {
        this._categoria = categoria;
    }
    get categoria() {
        return this._categoria;
    }
    set descripcion(descripcion) {
        this._descripcion = descripcion;
    }
    get descripcion() {
        return this._descripcion;
    }
    set monto(monto) {
        this._monto = monto;
    }
    get monto() {
        return this._monto;
    }
    set fecha(fecha) {
        this._fecha = fecha;
    }
    get fecha() {
        return this._fecha;
    }
}
