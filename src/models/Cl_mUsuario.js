export default class Cl_mUsuario {
    _nombre = "";
    _email = "";
    _id = "";
    constructor(id, nombre, email) {
        this._id = id;
        this._nombre = nombre;
        this._email = email;
    }
    set id(id) { this._id = id; }
    get id() { return this._id; }
    set nombre(nombre) { this._nombre = nombre; }
    get nombre() { return this._nombre; }
    set email(email) { this._email = email; }
    get email() { return this._email; }
}
