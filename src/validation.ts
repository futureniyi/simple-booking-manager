// Validates calendar dates without accepting JavaScript's rollover dates.
export function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day || year < 1 || month > 12) return false;
    const days = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day <= days[month - 1]!;
}

// Accepts only 24-hour times in HH:mm format, from 00:00 to 23:59.
export function isValidTime(value: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

// Checks for a basic email structure with a username, domain and domain suffix.
export function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Allows common phone separators and an optional leading +, with 7–15 digits.
export function isValidPhone(value: string): boolean {
    return /^\+?[\d ()-]+$/.test(value) && value.replace(/\D/g, "").length >= 7
        && value.replace(/\D/g, "").length <= 15;
}

export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;

// Checks whether the value exactly matches one of the supported booking statuses.
export function isValidStatus(value: string): boolean {
    return BOOKING_STATUSES.some(status => status === value);
}

// Converts a numbered menu choice to a status, returning undefined for invalid input.
export function statusFromChoice(choice: string): string | undefined {
    const answer = choice.trim();
    return BOOKING_STATUSES.find((_, index) => answer === String(index + 1));
}
