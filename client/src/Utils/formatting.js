/**
 * Formats the provided timeStamp
 * @param {string | number | Date} timeStamp - timeStamp to format
 * @returns {String} Formatted time as day, month date, hh:mm AM/PM
 * @example - Mon, Mar 31, 02:49 PM
 */
export function formatTime(timeStamp) {
    return new Date(timeStamp).toLocaleString('en-US', {
        timeZone: 'UTC', // prevent local timezone shift
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}
