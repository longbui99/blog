function tokenizePythonCode(code) {
  // Define Python keywords and their corresponding token classes
  const tokenPatterns = {
    keyword: {
      pattern: /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|raise|with|in|is|lambda|and|or|not|None|True|False)\b/g,
      className: 'token keyword'
    },
    function: {
      pattern: /(?<=def\s+)\w+(?=\s*\()|(?<=class\s+)\w+(?=\s*[:\(])/g,
      className: 'token function'
    },
    string: {
      pattern: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
      className: 'token string'
    },
    comment: {
      pattern: /#.*/g,
      className: 'token comment'
    },
    number: {
      pattern: /\b\d+\.?\d*\b/g,
      className: 'token number'
    },
    operator: {
      pattern: /[+\-*/%=<>!&|^~]+/g,
      className: 'token operator'
    },
    builtin: {
      pattern: /\b(print|len|range|str|int|float|list|dict|set|tuple)\b/g,
      className: 'token builtin'
    }
  };

  // Create a wrapper for the code
  let html = `<code class="language-python">`;
  let lastIndex = 0;

  // Process the code character by character
  while (lastIndex < code.length) {
    let earliestMatch = null;
    let earliestType = null;
    let earliestIndex = code.length;

    // Find the earliest matching token
    for (const [type, tokenInfo] of Object.entries(tokenPatterns)) {
      tokenInfo.pattern.lastIndex = lastIndex;
      const match = tokenInfo.pattern.exec(code);
      if (match && match.index < earliestIndex) {
        earliestMatch = match;
        earliestType = type;
        earliestIndex = match.index;
      }
    }

    // Add any plain text before the token
    if (earliestIndex > lastIndex) {
      html += escapeHtml(code.slice(lastIndex, earliestIndex));
    }

    // Add the token if found
    if (earliestMatch) {
      const tokenInfo = tokenPatterns[earliestType];
      html += `<span class="${tokenInfo.className}">${escapeHtml(earliestMatch[0])}</span>`;
      lastIndex = earliestIndex + earliestMatch[0].length;
    } else {
      // Add remaining text if no more tokens found
      html += escapeHtml(code.slice(lastIndex));
      break;
    }
  }

  html += '</code>';
  return html;
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default tokenizePythonCode; 