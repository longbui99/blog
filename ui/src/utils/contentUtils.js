import React from 'react';
import { attachmentProcessor } from '../processor/attachmentProcessor';

export function generateTOC(contentRef) {
  if (!contentRef.current) return [];

  const headers = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, h7');
  const items = Array.from(headers).map(header => ({
    id: header.id || header.innerText.toLowerCase().replace(/\s+/g, '-'),
    text: header.innerText,
    level: parseInt(header.tagName.charAt(1))
  }));

  // Add ids to headers if they don't have one
  headers.forEach(header => {
    if (!header.id) {
      header.id = header.innerText.toLowerCase().replace(/\s+/g, '-');
    }
  });

  return items;
}

export function renderChildren(children) {
  if (React.isValidElement(children)) {
    return children;
  } else if (Array.isArray(children)) {
    return children.map((child, index) => 
      React.isValidElement(child) ? React.cloneElement(child, { key: index }) : null
    );
  } else {
    console.warn('Invalid children passed to MainContent');
    return null;
  }
}

export async function processRawContent(rawContent, path) {
    // Updated regex to specifically match image data URLs
    const base64Regex = /data:image\/(jpeg|png|gif|bmp|webp|svg\+xml);base64,([^"'\s]+)/g;
    let match;
    let updatedContent = rawContent;

    while ((match = base64Regex.exec(rawContent)) !== null) {
        const imageType = match[1];  // jpeg, png, etc.
        const base64Data = match[2];
        const originalFilename = `image.${imageType === 'svg+xml' ? 'svg' : imageType}`;

        // Use the attachment processor
        const attachmentResponse = await attachmentProcessor.createAttachment(
            base64Data, 
            originalFilename, 
            path
        );

        if (attachmentResponse && attachmentResponse.filename) {
            // Replace base64 data with attachment URL
            const attachmentUrl = `/attachments/${attachmentResponse.filename}`;
            updatedContent = updatedContent.replace(match[0], attachmentUrl);
        }
    }

    return updatedContent;
}
