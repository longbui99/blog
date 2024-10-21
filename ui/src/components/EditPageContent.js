import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import '../styles/EditPageContent.css';
import { chatGPTProcessor } from '../processor/chatGPTProcessor';

function EditPageContent({ routes, onSave, onCancel, initialContent, currentPath }) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState('');
  const [urlPath, setUrlPath] = useState(currentPath);
  const [parent, setParent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);
  const [chatgptInput, setChatgptInput] = useState('');
  const [isChatGPTLoading, setIsChatGPTLoading] = useState(false);
  const [chatGPTError, setChatGPTError] = useState(null);

  useEffect(() => {
    setContent(initialContent);
    const currentRoute = routes.find(route => route.path === currentPath);
    setTitle(currentRoute?.title || '');
    setUrlPath(currentPath);
    setParent(currentRoute?.parent || null);
    setPrevious(currentRoute?.previous || null);
    setNext(currentRoute?.next || null);
  }, [initialContent, currentPath, routes]);

  const handleContentChange = (e) => setContent(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleUrlPathChange = (e) => setUrlPath(e.target.value);

  const routeOptions = useMemo(() => routes.map(route => ({
    value: route.path,
    label: route.title || route.path
  })), [routes]);

  const handleParentChange = (selectedOption) => {
    setParent(selectedOption ? selectedOption.value : null);
    setPrevious(null);
    setNext(null);
  };

  const handlePreviousChange = (selectedOption) => {
    setPrevious(selectedOption ? selectedOption.value : null);
  };

  const handleNextChange = (selectedOption) => {
    setNext(selectedOption ? selectedOption.value : null);
  };

  const handleSave = () => {
    onSave(urlPath, content, { title, parent, previous, next });
  };

  const handleChatgptInputChange = (e) => setChatgptInput(e.target.value);

  const handleChatgptSearch = async () => {
    setIsChatGPTLoading(true);
    setChatGPTError(null);
    try {
      const response = await chatGPTProcessor.getChatGPTResponse(chatgptInput);
      setContent(prevContent => prevContent + '\n\n' + response.response);
      setChatgptInput('');
    } catch (error) {
      setChatGPTError('Failed to get response from ChatGPT. Please try again.');
      console.error('ChatGPT Error:', error);
    } finally {
      setIsChatGPTLoading(false);
    }
  };

  return (
    <div className="edit-page-content">
      <div className="edit-controls">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter page title"
          className="page-title-input"
        />
        <input
          type="text"
          value={urlPath}
          onChange={handleUrlPathChange}
          placeholder="Enter URL path"
          className="url-path-input"
        />
        <div className="select-container">
          <label>Parent:</label>
          <Select
            options={routeOptions}
            value={routeOptions.find(option => option.value === parent)}
            onChange={handleParentChange}
            placeholder="Select parent"
            isClearable
            className="small-select"
          />
        </div>
        <div className="select-container">
          <label>Previous:</label>
          <Select
            options={routeOptions}
            value={routeOptions.find(option => option.value === parent)}
            onChange={handlePreviousChange}
            placeholder="Select previous"
            isClearable
            className="small-select"
          />
        </div>
        <div className="select-container">
          <label>Next:</label>
          <Select
            options={routeOptions}
            value={routeOptions.find(option => option.value === parent)}
            onChange={handleNextChange}
            placeholder="Select next"
            isClearable
            className="small-select"
          />
        </div>
      </div>
      <div className="edit-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Edit your content here..."
      />
      <div className="chatgpt-input">
        <input
          type="text"
          value={chatgptInput}
          onChange={handleChatgptInputChange}
          placeholder="Ask ChatGPT for input..."
        />
        <button onClick={handleChatgptSearch} disabled={isChatGPTLoading}>
          {isChatGPTLoading ? 'Searching...' : 'Search ChatGPT'}
        </button>
      </div>
      {chatGPTError && <p className="error">{chatGPTError}</p>}
    </div>
  );
}

export default EditPageContent;
