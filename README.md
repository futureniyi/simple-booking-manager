# Overview

Simple Booking Manager is a TypeScript terminal application for managing clients and bookings. It uses an interactive menu to let users:

- Add clients.
- Add bookings linked to a client ID.
- View clients.
- View bookings.
- Search bookings by client ID.
- Update booking status.
- Delete bookings.
- Add follow-up bookings to a parent booking.
- Display a booking and its follow-ups recursively with indentation.
- Save clients, bookings, and follow-ups to JSON.
- Load clients, bookings, and follow-ups from JSON.

I created this software as a learning project to practice TypeScript types, classes, arrays, recursion, async/await, exception handling, and compiling TypeScript to JavaScript. The program uses typed lists to organize data, validates numeric IDs and required fields, and handles file-saving and file-loading errors with try/catch.

With Node.js and npm installed, run `npm install` from the project root to install the project dependencies. Then compile and run:

```sh
npx tsc
node src/index.js
```

Follow the terminal prompts to select an action. When adding a booking or follow-up, available clients are listed and the selected client’s contact details are shown. Dates must be real calendar dates in `YYYY-MM-DD` format (for example, `2026-10-25`), and times use 24-hour `HH:mm` format (for example, `14:30`). For new bookings, follow-ups, and status updates, select a numbered status: `1. Pending`, `2. Confirmed`, `3. Completed`, or `4. Cancelled`. Invalid input is prompted again. Client and booking IDs must be unique positive whole numbers; client email and phone fields are also validated. Use option 10 to save data to `booking-data.json`, option 11 to load it, and option 12 to exit. Saving and loading are manual actions. Loading replaces the current client and booking lists and restores nested follow-ups as Booking objects.

[Software Demo Video](https://youtu.be/0cXxoj0DKaA)

# Development Environment

The development tools for this project include:

- Visual Studio Code for editing the source code.
- Node.js for running the compiled application and providing terminal and file APIs.
- TypeScript for typed properties, parameters, arrays, and classes.
- npm for managing dependencies and running the TypeScript compiler through `npx`.
- Git for version control.
- GitHub for hosting and sharing the repository.

TypeScript source files are compiled to JavaScript using `npx tsc`. The generated JavaScript uses CommonJS modules and runs with Node.js. The application uses Node.js `readline/promises` for terminal input and `fs/promises` for asynchronous JSON file storage. The `@types/node` package supplies TypeScript definitions for Node.js APIs.

# Useful Websites

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/api/)

# Future Work

- Check for booking conflicts before adding a booking.
- Allow editing client information.
- Expand search options to include booking date and status.
- Explore a graphical interface for managing clients and bookings.
