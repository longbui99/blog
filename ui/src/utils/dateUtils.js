export const format = (date, formatStr) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Format the date based on the provided format string
    let result = formatStr;
    
    // Replace patterns with unique tokens first
    const tokens = {
        'yyyy': year,
        'MMMM': monthNames[month],
        'MM': String(month + 1).padStart(2, '0'),
        'dd': String(day).padStart(2, '0'),
        'd': day,
        'h': hours % 12 || 12,
        'mm': String(minutes).padStart(2, '0'),
        'a': hours >= 12 ? 'PM' : 'AM'
    };
    
    // Replace tokens - Use regex with word boundaries for 'a' to avoid replacing 'a' in month names
    for (const [token, value] of Object.entries(tokens)) {
        if (token === 'a') {
            // Only replace 'a' when it's a standalone token (surrounded by non-word chars or at string boundaries)
            result = result.replace(/\ba\b/g, value);
        } else {
            result = result.replace(token, value);
        }
    }
    
    return result;
};
