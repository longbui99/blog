// Define token patterns for each language
const TOKEN_PATTERNS = {
  python: {
    keyword: {
      pattern: /(?<!\.)(?<!\w)\b(class|if|from|import|while|for|in|is|as|with|try|except|finally|raise|assert|and|or|not|elif|else|pass|break|continue|lambda|yield|global|nonlocal|def|return)\b/g,
      className: 'token keyword'
    },
    dunder: {
      pattern: /\b(__name__|__init__|__str__|__repr__|__len__|__getitem__|__setitem__|__delitem__|__iter__|__next__|__enter__|__exit__|__call__|__add__|__sub__|__mul__|__div__|__mod__|__pow__|__eq__|__ne__|__lt__|__gt__|__le__|__ge__|__hash__|__bool__|__contains__|__getattr__|__setattr__|__delattr__|__new__|__del__|__copy__|__deepcopy__|__getstate__|__setstate__)\b/g,
      className: 'token dunder'
    },
    builtin: {
      pattern: /(?<!\.)(?<!\w)\b(print|pass|len|range|str|int|float|list|dict|set|tuple|bool|enumerate|zip|map|filter|any|all|sum|min|max|abs|round|sorted|reversed|iter|next|super|isinstance|issubclass|hasattr|getattr|setattr|delattr|property|classmethod|staticmethod|type|id|hex|bin|oct|ord|chr|pow|divmod|eval|exec|repr|input|open|file|quit|exit)\b/g,
      className: 'token builtin'
    },
    inherit: {
      pattern: /(?<=class\s+\w+\()[\w,\s]+(?=\))/g,
      className: 'token inherit'
    },
    decorator: {
      pattern: /@[\w.]+(?=\(|$|\s)/g,
      className: 'token decorator'
    },
    function: {
      pattern: /(?<=def\s+)\w+(?=\()/g,
      className: 'token function'
    },
    self: {
      pattern: /\bself?.\b/g,
      className: 'token self'
    }
  },  
  yaml: {
    keyword: {
      // Match Kubernetes-specific keywords and field names
      pattern: /^[ \t]*[a-zA-Z][\w-]*(?=:)/gm,
      className: 'token keyword'
    },
    comment: {
      // Match comments starting with #
      pattern: /#.*$/gm,
      className: 'token comment'
    },
    number: {
      // Match storage sizes (e.g., 10Gi) and other numeric values
      pattern: /\b\d+(?:\.\d+)?(?:Gi|Mi|Ki|[A-Za-z]+)?\b/g,
      className: 'token number'
    },
    punctuation: {
      // Match YAML structural elements
      pattern: /[-:]/g,
      className: 'token punctuation'
    }
  },
  // Common patterns shared across languages
  common: {
    string: {
      pattern: /"[^"]*"|'[^']*'/g,
      className: 'token string'
    },
    comment: {
      pattern: /#.*/g,
      className: 'token comment'
    },
    number: {
      pattern: /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|0x[\da-f]+|0b[01]+|0o[0-7]+/gi,
      className: 'token number'
    },
    boolean: {
      pattern: /\b(?:true|false|True|False)\b/g,
      className: 'token boolean'
    },
    null: {
      pattern: /\b(?:null|None|~)\b/g,
      className: 'token null'
    },
    punctuation: {
      pattern: /[.,()]/g,
      className: 'token punctuation'
    }
  }
};

function tokenizeCode(code, language) {
  // Get language-specific patterns and combine with common patterns
  const patterns = {
    ...TOKEN_PATTERNS.common,
    ...(TOKEN_PATTERNS[language] || {})
  };

  // Create a wrapper for the code
  let html = `<code class="language-${language}">`;
  let lastIndex = 0;

  // Process the code character by character
  while (lastIndex < code.length) {
    let earliestMatch = null;
    let earliestType = null;
    let earliestIndex = code.length;

    // Find the earliest matching token
    for (const [type, tokenInfo] of Object.entries(patterns)) {
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
      const tokenInfo = patterns[earliestType];
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
}// In syntaxHighlighter.js

export default tokenizeCode;