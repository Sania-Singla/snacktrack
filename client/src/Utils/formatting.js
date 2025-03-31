/**
 * Formats the provided timeStamp
 * @param {TimeStamp} timeStamp - timeStamp to format
 * @returns {String} Formatted time as day, month date, hh:mm AM/PM
 * @example - Mon, Mar 31, 02:49 PM
 */

function formatTime(timeStamp) {
    return new Date(timeStamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export { formatTime };
