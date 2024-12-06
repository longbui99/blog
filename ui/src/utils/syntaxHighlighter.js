function tokenizePythonCode(code) {
  const tokenPatterns = {
    keyword: {
      pattern: /(?<!\.)(?<!\w)\b(class|if|from|import|while|for|in|is|as|with|try|except|finally|raise|assert|and|or|not|elif|else|pass|break|continue|lambda|yield|global|nonlocal|def|return)\b/g,
      className: 'token keyword'
    },
    dunder: {
        pattern: /\b(__init__|__str__|__repr__|__len__|__getitem__|__setitem__|__delitem__|__iter__|__next__|__enter__|__exit__|__call__|__add__|__sub__|__mul__|__div__|__mod__|__pow__|__eq__|__ne__|__lt__|__gt__|__le__|__ge__|__hash__|__bool__|__contains__|__getattr__|__setattr__|__delattr__|__new__|__del__|__copy__|__deepcopy__|__getstate__|__setstate__)\b/g,
        className: 'token dunder'
    },
    builtin: {
        pattern: /(?<!\.)(?<!\w)\b(print|pass|len|range|str|int|float|list|dict|set|tuple|bool|enumerate|zip|map|filter|any|all|sum|min|max|abs|round|sorted|reversed|iter|next|super|isinstance|issubclass|hasattr|getattr|setattr|delattr|property|classmethod|staticmethod|type|id|hex|bin|oct|ord|chr|pow|divmod|eval|exec|repr|input|open|file|quit|exit)\b/g,
        className: 'token builtin'
    },
    function: {
      pattern: /(?<=def\s+)\w+(?=\()/g,
      className: 'token function'
    },
    self: {
      pattern: /\bself?.\b/g,
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