import { attachmentProcessor } from '../../../processor/attachmentProcessor';

export const DetermineAndSaveAttachments = async (content, path) => {
    if (!content) return content;

    // Find all img tags with base64 src
    const base64Regex = /data:image\/(jpeg|png|gif|bmp|webp|svg\+xml);base64,([^"'\s]+)/g;
    let match;
    let updatedContent = content;

    while ((match = base64Regex.exec(content)) !== null) {
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
        } else {
            return null;
        }
    }

    return updatedContent;
};
