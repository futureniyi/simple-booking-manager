export class Client {
    id: number;
    name: string;
    phone: string;
    email: string;

    // Creates a client with an ID, name and contact details.
    constructor(id: number, name: string, phone: string, email: string) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
    }
}
