import { isValidDate, isValidTime, isValidEmail, isValidPhone, isValidStatus, BOOKING_STATUSES } from "./validation";
import { Client } from "./client";
import { Booking } from "./booking";
import { readFile, writeFile } from "node:fs/promises";

export class BookingManager {
    clients: Client[];
    bookings: Booking[];

    // Starts the manager with empty client and booking lists.
    constructor() {
        this.clients = [];
        this.bookings = [];
    }

    // Saves both lists as JSON and reports file-writing errors without crashing.
    async saveData(filePath: string): Promise<void> {
        try {
            const data = { clients: this.clients, bookings: this.bookings };
            await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
            console.log(`Data saved to ${filePath}.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.log(`Could not save data to ${filePath}: ${message}`);
        }
    }

    // Restores both lists; failed reads or invalid JSON leave current data unchanged.
    async loadData(filePath: string): Promise<void> {
        try {
            const json = await readFile(filePath, "utf8");
            const data: { clients: Client[]; bookings: Booking[] } = JSON.parse(json);
            const clients = data.clients.map(client =>
                new Client(client.id, client.name, client.phone, client.email)
            );
            const bookings = data.bookings.map(booking => this.restoreBooking(booking));
            this.clients = clients;
            this.bookings = bookings;
            console.log(`Data loaded from ${filePath}.`);
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.log(`Could not load data: ${filePath} contains invalid JSON.`);
            } else if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                console.log(`Could not load data: ${filePath} was not found. Save data first.`);
            } else {
                const message = error instanceof Error ? error.message : "Unknown error";
                console.log(`Could not load data from ${filePath}: ${message}`);
            }
        }
    }

    // Rebuilds a plain JSON object as a Booking, then restores each follow-up.
    // Recursion stops when followUps is empty and map has no items to restore.
    private restoreBooking(data: Booking): Booking {
        const booking = new Booking(
            data.id, data.clientId, data.bookingDate,
            data.bookingTime, data.status, data.notes
        );
        booking.followUps = data.followUps.map(followUp => this.restoreBooking(followUp));
        return booking;
    }

    // Adds a client to this manager's list of clients.
    addClient(client: Client): void {
        if (!Number.isSafeInteger(client.id) || client.id <= 0 || this.clients.some(item => item.id === client.id)) {
            throw new Error("Client ID must be a unique positive whole number.");
        }
        if (!client.name.trim() || !isValidPhone(client.phone) || !isValidEmail(client.email)) {
            throw new Error("A client needs a name, valid phone number and valid email address.");
        }
        this.clients.push(client);
    }

    // Adds a booking to this manager's list of bookings.
    addBooking(booking: Booking): void {
        this.validateBooking(booking);
        this.bookings.push(booking);
    }

    // Checks the entire booking tree for an ID to prevent duplicate bookings.
    hasBookingId(id: number): boolean {
        // Searches each follow-up list recursively; an empty list returns false.
        const contains = (bookings: Booking[]): boolean => bookings.some(
            booking => booking.id === id || contains(booking.followUps)
        );
        return contains(this.bookings);
    }

    // Rejects duplicate IDs, unknown clients and invalid booking fields before adding.
    private validateBooking(booking: Booking): void {
        if (!Number.isSafeInteger(booking.id) || booking.id <= 0 || this.hasBookingId(booking.id)) {
            throw new Error("Booking ID must be a unique positive whole number.");
        }
        if (!this.clients.some(client => client.id === booking.clientId)) {
            throw new Error("Choose an existing client for the booking.");
        }
        if (!isValidDate(booking.bookingDate) || !isValidTime(booking.bookingTime) || !isValidStatus(booking.status)) {
            throw new Error("A booking needs a real date (YYYY-MM-DD), a time (HH:mm) and a status of Pending, Confirmed, Completed or Cancelled.");
        }
    }

    // Displays every client's information in the terminal.
    viewClients(): void {
        console.log("CLIENTS");
        for (const client of this.clients) {
            console.log(`ID: ${client.id}`);
            console.log(`Name: ${client.name}`);
            console.log(`Phone: ${client.phone}`);
            console.log(`Email: ${client.email}`);
            console.log("");
        }
    }

    // Finds and displays bookings for a client, or reports when none match.
    searchBookingsByClient(clientId: number): void {
        const matchingBookings = this.bookings.filter(
            booking => booking.clientId === clientId
        );

        if (matchingBookings.length === 0) {
            console.log(`No bookings found for client ID ${clientId}.`);
            return;
        }

        console.log(`BOOKINGS FOR CLIENT ${clientId}`);
        for (const booking of matchingBookings) {
            console.log(`ID: ${booking.id}`);
            console.log(`Client ID: ${booking.clientId}`);
            console.log(`Date: ${booking.bookingDate}`);
            console.log(`Time: ${booking.bookingTime}`);
            console.log(`Status: ${booking.status}`);
            console.log(`Notes: ${booking.notes}`);
            console.log("");
        }
    }

    // Updates a booking's status by ID, or reports when the booking is missing.
    updateBookingStatus(bookingId: number, newStatus: string): void {
        const booking = this.bookings.find(booking => booking.id === bookingId);

        if (booking === undefined) {
            console.log(`Booking ID ${bookingId} not found.`);
            return;
        }

        if (!isValidStatus(newStatus)) throw new Error(`Choose a status: ${BOOKING_STATUSES.join(", ")}.`);
        booking.status = newStatus;
        console.log(`Booking ID ${bookingId} status updated to ${newStatus}.`);
    }

    // Removes a booking by ID, or reports when the booking is missing.
    deleteBooking(bookingId: number): void {
        const bookingIndex = this.bookings.findIndex(
            booking => booking.id === bookingId
        );

        if (bookingIndex === -1) {
            console.log(`Booking ID ${bookingId} not found.`);
            return;
        }

        this.bookings.splice(bookingIndex, 1);
        console.log(`Booking ID ${bookingId} deleted.`);
    }

    // Adds a follow-up to a parent booking, or reports a missing parent.
    addFollowUpBooking(parentBookingId: number, followUpBooking: Booking): void {
        const parent = this.bookings.find(booking => booking.id === parentBookingId);

        if (parent === undefined) {
            console.log(`Parent booking ID ${parentBookingId} not found.`);
            return;
        }

        this.validateBooking(followUpBooking);
        parent.followUps.push(followUpBooking);
        console.log(`Follow-up booking ID ${followUpBooking.id} added to booking ID ${parentBookingId}.`);
    }

    // Recursively displays a booking by calling itself for each follow-up.
    // The recursion stops naturally when followUps is empty: the loop runs zero times.
    displayBookingWithFollowUps(booking: Booking, level: number = 0): void {
        const indentation = "  ".repeat(level);
        console.log(`${indentation}ID: ${booking.id}`);
        console.log(`${indentation}Client ID: ${booking.clientId}`);
        console.log(`${indentation}Date: ${booking.bookingDate}`);
        console.log(`${indentation}Time: ${booking.bookingTime}`);
        console.log(`${indentation}Status: ${booking.status}`);
        console.log(`${indentation}Notes: ${booking.notes}`);
        console.log("");

        for (const followUp of booking.followUps) {
            this.displayBookingWithFollowUps(followUp, level + 1);
        }
    }

    // Finds a booking and displays its complete follow-up tree.
    viewBookingWithFollowUps(bookingId: number): void {
        const booking = this.bookings.find(booking => booking.id === bookingId);

        if (booking === undefined) {
            console.log(`Booking ID ${bookingId} not found.`);
            return;
        }

        this.displayBookingWithFollowUps(booking);
    }

    // Displays every booking's information in the terminal.
    viewBookings(): void {
        console.log("BOOKINGS");
        for (const booking of this.bookings) {
            console.log(`ID: ${booking.id}`);
            console.log(`Client ID: ${booking.clientId}`);
            console.log(`Date: ${booking.bookingDate}`);
            console.log(`Time: ${booking.bookingTime}`);
            console.log(`Status: ${booking.status}`);
            console.log(`Notes: ${booking.notes}`);
            console.log("");
        }
    }
}
