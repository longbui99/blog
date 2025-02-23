/**
 * Checks if a string contains HTML markup
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text contains HTML markup
 */
export const isHTML = (text) => {
    const htmlRegex = /<[a-z][\s\S]*>/i;
    return htmlRegex.test(text);
};

/**
 * Converts plain text to HTML, preserving line breaks and paragraphs
 * @param {string} text - The plain text to convert
 * @returns {string} - The HTML string
 */
export const plainToHTML = (text) => {
    if (!text) return '';
    if (isHTML(text)) return text;

    return text
        // Replace line breaks with <br> tags
        .split('\n')
        // Wrap non-empty lines in <p> tags
        .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
        .join('');
};

/**
 * Inserts content at the current selection, converting plain text to HTML if needed
 * @param {string} text - The content to insert
 * @param {Range} range - The range where to insert the content
 * @returns {Range} - The updated range
 */
export const insertContent = (text, range) => {
    if (!range || !text) return null;

    // Create temporary container
    const temp = document.createElement('div');
    
    // Check if text is HTML and convert if needed
    const isHTML = /<[a-z][\s\S]*>/i.test(text);
    temp.innerHTML = isHTML 
        ? text 
        : text.split('\n')
              .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
              .join('');
    
    // Insert the content
    range.deleteContents();
    range.insertNode(temp);
    
    // Update range position
    range.setStartAfter(temp);
    range.setEndAfter(temp);

    return range;
};
