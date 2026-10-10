const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isValidDate, isValidTime, isValidEmail, isValidPhone } = require('../src/validation.js');
const { BookingManager } = require('../src/bookingManager.js');
const { Client } = require('../src/client.js');
const { Booking } = require('../src/booking.js');

test('dates validate calendar boundaries and leap years', () => {
    for (const date of ['2024-02-29', '2000-02-29', '2026-12-31']) assert.equal(isValidDate(date), true);
    for (const date of ['2026-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '0000-01-01', '2026-1-01', '10/25/2026']) assert.equal(isValidDate(date), false);
});

test('times require 24-hour HH:mm', () => {
    for (const time of ['00:00', '14:30', '23:59']) assert.equal(isValidTime(time), true);
    for (const time of ['24:00', '12:60', '9:30', '2:30 PM', '']) assert.equal(isValidTime(time), false);
});

test('client contact validation', () => {
    assert.equal(isValidEmail('name@example.com'), true);
    assert.equal(isValidEmail('name@'), false);
    assert.equal(isValidPhone('+234 801-234-5678'), true);
    assert.equal(isValidPhone('abc1234567'), false);
    assert.equal(isValidPhone('123'), false);
});

test('manager rejects duplicates, missing clients and invalid booking data', () => {
    const manager = new BookingManager();
    const client = new Client(1, 'Ada', '08012345678', 'ada@example.com');
    manager.addClient(client);
    assert.throws(() => manager.addClient(client), /unique/);
    const booking = (id, clientId = 1, date = '2026-10-25') => new Booking(id, clientId, date, '14:30', 'Pending', '');
    manager.addBooking(booking(1));
    assert.throws(() => manager.addBooking(booking(1)), /unique/);
    assert.throws(() => manager.addBooking(booking(2, 999)), /existing client/);
    assert.throws(() => manager.addBooking(booking(2, 1, '2026-02-30')), /real date/);
    manager.addFollowUpBooking(1, booking(2));
    assert.throws(() => manager.addBooking(booking(2)), /unique/);
    assert.throws(() => manager.addFollowUpBooking(1, booking(3, 999)), /existing client/);
    assert.equal(manager.bookings.length, 1);
    assert.equal(manager.bookings[0].followUps.length, 1);
});

test('numbered status choices map to supported statuses and reject invalid input', () => {
    const { statusFromChoice, isValidStatus } = require('../src/validation.js');
    ['Pending', 'Confirmed', 'Completed', 'Cancelled'].forEach((status, index) => {
        assert.equal(statusFromChoice(String(index + 1)), status);
        assert.equal(isValidStatus(status), true);
    });
    assert.equal(statusFromChoice(' 2 '), 'Confirmed');
    for (const choice of ['', '0', '5', '1.0', '01', 'Pending']) {
        assert.equal(statusFromChoice(choice), undefined);
    }
    const manager = new BookingManager();
    manager.addClient(new Client(1, 'Ada', '08012345678', 'ada@example.com'));
    const booking = new Booking(1, 1, '2026-10-25', '14:30', 'Unknown', '');
    assert.throws(() => manager.addBooking(booking), /status/);
    booking.status = 'Pending';
    manager.addBooking(booking);
    assert.throws(() => manager.updateBookingStatus(1, 'Unknown'), /status/);
    assert.equal(booking.status, 'Pending');
    manager.updateBookingStatus(1, 'Completed');
    assert.equal(booking.status, 'Completed');
});
