declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_API_BASE_URL: string;
            REACT_APP_BLOG_CONTENT_PATH: string;
            REACT_APP_AUTH_PATH: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export {};
