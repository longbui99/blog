class ComposerRegistry {
    constructor() {
        this.transformers = new Map();
    }

    // Register a new transformer
    register(key, transformer) {
        if (typeof transformer !== 'function') {
            throw new Error('Transformer must be a function');
        }
        this.transformers.set(key, transformer);
    }

    // Transform content using registered transformer
    transform(key, content, params = {}) {
        const transformer = this.transformers.get(key);
        if (!transformer) {
            console.warn(`No transformer registered for key: ${key}`);
            return content;
        }
        try {
            return transformer(content, params);
        } catch (error) {
            console.error(`Error transforming content with key ${key}:`, error);
            return content;
        }
    }

    // Check if a transformer exists
    has(key) {
        return this.transformers.has(key);
    }

    // Remove a transformer
    unregister(key) {
        return this.transformers.delete(key);
    }
}

// Create singleton instance
const composerRegistry = new ComposerRegistry();

// Register default transformers
composerRegistry.register('bold', (content) => `<strong>${content}</strong>`);
composerRegistry.register('italic', (content) => `<em>${content}</em>`);
composerRegistry.register('underline', (content) => `<u>${content}</u>`);
composerRegistry.register('link', (content, { href, title }) => 
    `<a href="${href}" title="${title || ''}">${content}</a>`
);
composerRegistry.register('image', (content, { src, alt }) => 
    `<img src="${src}" alt="${alt || content}" />`
);
composerRegistry.register('align', (content, { direction }) => 
    `<div style="text-align: ${direction}">${content}</div>`
);
composerRegistry.register('color', (content, { color }) => 
    `<span style="color: ${color}">${content}</span>`
);

export default composerRegistry;
