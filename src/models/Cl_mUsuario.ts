export default class Cl_mUsuario {
    private _nombre: string = "";
    private _email: string = "";
    private _id: string = "";

    constructor(
        id: string, 
        nombre: string, 
        email: string
    ) {
        this._id = id;
        this._nombre = nombre;
        this._email = email;
    }
    set id(id: string) { this._id = id; }
    get id(): string { return this._id; }

    set nombre(nombre: string) { this._nombre = nombre; }
    get nombre(): string { return this._nombre; }

    set email(email: string) { this._email = email; }
    get email(): string { return this._email; }
}