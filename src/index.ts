import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Client } from "./client";
import { Booking } from "./booking";
import { BookingManager } from "./bookingManager";

import { isValidDate, isValidTime, isValidEmail, isValidPhone, BOOKING_STATUSES, statusFromChoice } from "./validation";

const manager = new BookingManager();
const terminal = readline.createInterface({ input: stdin, output: stdout });

// Asks a terminal question and returns the user's answer as a string.
async function askQuestion(question: string): Promise<string> {
    return terminal.question(question);
}

// Repeats the question until the user enters a positive whole-number ID.
async function askNumber(question: string): Promise<number> {
    while (true) {
        const answer = await askQuestion(question);
        const id = Number(answer);
        if (Number.isSafeInteger(id) && id > 0) {
            return id;
        }
        console.log("Please enter a positive whole-number ID.");
    }
}

// Repeats the question until a required field contains non-whitespace text.
async function askRequired(question: string): Promise<string> {
    while (true) {
        const answer = (await askQuestion(question)).trim();
        if (answer.length > 0) {
            return answer;
        }
        console.log("This field is required. Please enter a value.");
    }
}

// Repeats a prompt until its validation function accepts the trimmed input.
async function askValidated(question: string, validate: (value: string) => boolean, message: string): Promise<string> {
    while (true) {
        const answer = (await askQuestion(question)).trim();
        if (validate(answer)) return answer;
        console.log(message);
    }
}

// Displays numbered status options and repeats until a valid option is selected.
async function askStatus(): Promise<string> {
    console.log("\nBOOKING STATUS");
    BOOKING_STATUSES.forEach((status, index) => console.log(`${index + 1}. ${status}`));
    while (true) {
        const status = statusFromChoice(await askQuestion(`Choose a status (1–${BOOKING_STATUSES.length}): `));
        if (status !== undefined) return status;
        console.log(`Please choose a status from 1 to ${BOOKING_STATUSES.length}.`);
    }
}

// Repeats the ID prompt until the supplied lookup confirms the ID is unused.
async function askUniqueId(question: string, exists: (id: number) => boolean): Promise<number> {
    while (true) {
        const id = await askNumber(question);
        if (!exists(id)) return id;
        console.log("That ID is already in use. Please choose a different ID.");
    }
}

// Shows available clients and accepts only an existing ID; returns to the menu if empty.
async function askExistingClientId(): Promise<number | undefined> {
    if (manager.clients.length === 0) {
        console.log("No clients available. Choose option 1 to add a client, or option 11 to load saved data.");
        return undefined;
    }

    console.log("\nAVAILABLE CLIENTS");
    for (const client of manager.clients) {
        console.log(`ID: ${client.id} - ${client.name}`);
    }

    while (true) {
        const clientId = await askNumber("Choose an existing client ID: ");
        if (manager.clients.some(client => client.id === clientId)) {
            const client = manager.clients.find(client => client.id === clientId)!;
            console.log(`Selected client: ${client.name} (ID: ${client.id}) | Phone: ${client.phone} | Email: ${client.email}`);
            return clientId;
        }
        console.log("Client not found. Please choose an ID from the list above.");
    }
}

// Displays the choices and repeats until the user chooses Exit.
async function runMenu(): Promise<void> {
    let running = true;

    while (running) {
        console.log("\nSIMPLE BOOKING MANAGER");
        console.log("\n1. Add client");
        console.log("2. Add booking");
        console.log("3. View clients");
        console.log("4. View bookings");
        console.log("5. Search bookings by client");
        console.log("6. Update booking status");
        console.log("7. Delete booking");
        console.log("8. Add follow-up booking");
        console.log("9. View booking with follow-ups");
        console.log("10. Save data");
        console.log("11. Load data");
        console.log("12. Exit");

        const choice = await askQuestion("Choose an option: ");

        try {
            switch (choice.trim()) {
                case "1": {
                    const id = await askUniqueId("Client ID: ", id => manager.clients.some(client => client.id === id));
                    const name = await askRequired("Name: ");
                    const phone = await askValidated("Phone (7–15 digits, optional +, spaces or hyphens): ", isValidPhone, "Enter a valid phone number with 7–15 digits.");
                    const email = await askValidated("Email (e.g. name@example.com): ", isValidEmail, "Enter a valid email address, e.g. name@example.com.");
                    manager.addClient(new Client(id, name, phone, email));
                    console.log("Client added.");
                    break;
                }
                case "2": {
                    const clientId = await askExistingClientId();
                    if (clientId === undefined) {
                        break;
                    }
                    const id = await askUniqueId("Booking ID: ", id => manager.hasBookingId(id));
                    const date = await askValidated("Booking date (YYYY-MM-DD, e.g. 2026-10-25): ", isValidDate, "Enter a real calendar date in YYYY-MM-DD format.");
                    const time = await askValidated("Booking time (24-hour HH:mm, e.g. 14:30): ", isValidTime, "Enter a time from 00:00 to 23:59 in HH:mm format.");
                    const status = await askStatus();
                    const notes = await askQuestion("Notes: ");
                    manager.addBooking(new Booking(id, clientId, date, time, status, notes));
                    console.log("Booking added.");
                    break;
                }
                case "3":
                    manager.viewClients();
                    break;
                case "4":
                    manager.viewBookings();
                    break;
                case "5": {
                    const clientId = await askNumber("Client ID: ");
                    manager.searchBookingsByClient(clientId);
                    break;
                }
                case "6": {
                    const bookingId = await askNumber("Booking ID: ");
                    const newStatus = await askStatus();
                    manager.updateBookingStatus(bookingId, newStatus);
                    break;
                }
                case "7": {
                    const bookingId = await askNumber("Booking ID: ");
                    manager.deleteBooking(bookingId);
                    break;
                }
                case "8": {
                    const clientId = await askExistingClientId();
                    if (clientId === undefined) {
                        break;
                    }
                    const parentBookingId = await askNumber("Parent booking ID: ");
                    if (!manager.bookings.some(booking => booking.id === parentBookingId)) {
                        console.log(`Parent booking ID ${parentBookingId} not found.`);
                        break;
                    }
                    const id = await askUniqueId("Follow-up booking ID: ", id => manager.hasBookingId(id));
                    const date = await askValidated("Booking date (YYYY-MM-DD, e.g. 2026-10-25): ", isValidDate, "Enter a real calendar date in YYYY-MM-DD format.");
                    const time = await askValidated("Booking time (24-hour HH:mm, e.g. 14:30): ", isValidTime, "Enter a time from 00:00 to 23:59 in HH:mm format.");
                    const status = await askStatus();
                    const notes = await askQuestion("Notes: ");
                    const followUp = new Booking(id, clientId, date, time, status, notes);
                    manager.addFollowUpBooking(parentBookingId, followUp);
                    break;
                }
                case "9": {
                    const bookingId = await askNumber("Booking ID: ");
                    manager.viewBookingWithFollowUps(bookingId);
                    break;
                }
                case "10":
                    await manager.saveData("booking-data.json");
                    break;
                case "11":
                    await manager.loadData("booking-data.json");
                    break;
                case "12":
                    console.log("Goodbye!");
                    running = false;
                    terminal.close();
                    break;
                default:
                    console.log("Please choose an option from 1 to 12.");
            }
        } catch (error) {
            console.log(error instanceof Error ? error.message : "Could not complete this action.");
        }
    }
}

runMenu();
