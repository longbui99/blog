function tokenizePythonCode(code) {
  const tokenPatterns = {
    keyword: {
      pattern: /\b(class|def|if|__name__|return)\b/g,
      className: 'token keyword'
    },
    builtin: {
      pattern: /\b(print|__init__)\b/g,
      className: 'token builtin'
    },
    function: {
      pattern: /(?<=class\s+)\w+|(?<=def\s+)\w+(?=\()/g,
      className: 'token function'
    },
    self: {
      pattern: /\bself\b/g,
      className: 'token self'
    },
    string: {
      pattern: /"[^"]*"|'[^']*'/g,
      className: 'token string'
    },
    comment: {
      pattern: /#.*/g,
      className: 'token comment'
    },
    method: {
      pattern: /\b\w+(?=\()/g,
      className: 'token method'
    },
    punctuation: {
      pattern: /[.,()]/g,
      className: 'token punctuation'
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