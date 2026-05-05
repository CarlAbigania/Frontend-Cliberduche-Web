// src/utils/dateTimeUtils.js

/**
 * Format a date object to YYYY-MM-DD
 */
export const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convert a 24-hour time string (e.g., "14:30" or "14:30:00") to 12-hour format with AM/PM.
 * Returns something like "2:30 PM".
 */
export const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    // Extract hours and minutes (ignore seconds if present)
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr; // fallback

    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format a time range given start and end time strings.
 * Example: "2:30 PM – 3:30 PM"
 */
export const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    return `${formatTimeTo12Hour(startTime)} – ${formatTimeTo12Hour(endTime)}`;
};

/**
 * Format a time range given a start time and a duration in minutes.
 * Example: ( "14:30", 90 ) => "2:30 PM – 4:00 PM"
 */
export const formatTimeRangeFromDuration = (startTime, durationMinutes) => {
    if (!startTime || durationMinutes == null) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return startTime;

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    return `${formatTimeTo12Hour(startTime)} – ${formatTimeTo12Hour(endTimeStr)}`;
};

/**
 * Format a full appointment date + time range using the appointment's duration.
 * Example: "January 15, 2025 at 2:30 PM – 3:30 PM"
 */
export const formatAppointmentDateTime = (dateStr, startTime, durationMinutes) => {
    if (!dateStr || !startTime) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const timeRange = formatTimeRangeFromDuration(startTime, durationMinutes);
        return `${formattedDate} at ${timeRange}`;
    } catch (e) {
        return 'Invalid Date';
    }
};

/**
 * Get the first and last date of the month for a given Date object.
 * Returns an object { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
export const getMonthRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return {
        start: formatDate(start),
        end: formatDate(end),
    };
};