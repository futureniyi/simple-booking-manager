export class Booking {
    id: number;
    clientId: number;
    bookingDate: string;
    bookingTime: string;
    status: string;
    notes: string;
    followUps: Booking[];

    // Creates a booking linked to a client and starts with no follow-ups.
    constructor(
        id: number,
        clientId: number,
        bookingDate: string,
        bookingTime: string,
        status: string,
        notes: string
    ) {
        this.id = id;
        this.clientId = clientId;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.status = status;
        this.notes = notes;
        this.followUps = [];
    }
}
