import React, { useState } from 'react';
import '../styles/CodeBlock.css';

const CodeBlock = ({ code, language, inline = false }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getLanguageClass = () => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'language-python';
      case 'javascript':
      case 'js':
        return 'language-javascript';
      case 'bash':
      case 'shell':
        return 'language-bash';
      case 'go':
      case 'golang':
        return 'language-go';
      case 'xml':
        return 'language-xml';
      case 'html':
        return 'language-html';
      default:
        return 'language-python';
    }
  };

  if (inline) {
    return <code className={getLanguageClass()}>{code}</code>;
  }

  return (
    <div className="code-block-container">
      <pre className={getLanguageClass()}>
        <code>{code}</code>
      </pre>
      <button className="copy-button" onClick={copyToClipboard}>
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default CodeBlock;
