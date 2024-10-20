import React, { useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import '../styles/CodeBlock.css';

function CodeBlock({ code, language, inline }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const isMultiLine = lines.length > 1;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (inline || !isMultiLine) {
    return (
      <code className={`inline-code language-${language}`}>
        {code}
      </code>
    );
  }

  return (
    <div className="code-block-wrapper">
      <button className="copy-button" onClick={copyToClipboard}>
        {copied ? 'Copied!' : <FaCopy />}
      </button>
      <pre className={`language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
