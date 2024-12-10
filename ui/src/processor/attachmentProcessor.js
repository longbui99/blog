import { BaseProcessor } from './baseProcessor';

class AttachmentProcessor extends BaseProcessor {
    constructor() {
        super();
        this.baseEndpoint = `${process.env.REACT_APP_ATTACHMENT_PATH}`;
    }

    async createAttachment(base64Data, originalFilename, path) {
        try {
            return await this.makeRequest('post', this.baseEndpoint, {
                path: path,
                file_data: base64Data,
                original_filename: originalFilename,
            });
        } catch (error) {
            console.error('Error creating attachment:', error);
            return null;
        }
    }

    async getAttachment(filename) {
        return await this.makeRequest('get', `${this.baseEndpoint}/${filename}`);
    }

    async updateAttachment(attachmentId, data) {
        return await this.makeRequest('put', `${this.baseEndpoint}/${attachmentId}`, data);
    }

    async deleteAttachment(attachmentId) {
        return await this.makeRequest('delete', `${this.baseEndpoint}/${attachmentId}`);
    }

    async cleanupAttachments() {
        return await this.makeRequest('post', `${this.baseEndpoint}/cleanup`);
    }
}

// Export a singleton instance
export const attachmentProcessor = new AttachmentProcessor(); 