# Project Title

## Introduction
This project is a blogging application that employs a FastAPI backend alongside a React.js frontend. It is designed to efficiently deliver blog content while offering a user-friendly interface. The backend is responsible for processing API requests and providing the necessary data, while the frontend focuses on rendering the user interface and managing user interactions.

## UI Block

### Tech Stack
- **React.js**: A JavaScript library utilized for constructing user interfaces, enabling the development of dynamic and responsive web applications.

### Configuration
To ensure security, please duplicate the `.env.template` file to create an `.env` file (which will be excluded from the code). The UI configuration is governed by environment variables specified in the `.env.template` file. Below are the environment variables along with their descriptions:

- `REACT_APP_ADMIN_DOMAIN`: The domain designated for the blog's admin interface.
- `REACT_APP_API_BASE_URL`: The base URL for the API endpoints.
- `REACT_APP_BLOG_CONTENT_PATH`: The path for accessing blog content.
- `REACT_APP_BLOG_MENU_PATH`: The path for the blog menu.
- `REACT_APP_AUTH_PATH`: The path for endpoints related to authentication.
- `REACT_APP_CHATGPT_PATH`: The path for integrating ChatGPT.

## Webserver Block

### FastAPI
The backend of this application is constructed using **FastAPI**, a contemporary web framework for building APIs with Python 3.6+ that leverages standard Python type hints.

### Configuration
To ensure security, please duplicate the `.env.template` file to create an `.env` file (which will be excluded from the code). The backend configuration is managed through environment variables defined in the `.env.template` file. Below are the environment variables along with their descriptions:

- `PROJECT_NAME`: The title of the project.
- `DATABASE_URL`: The connection string for the database.
- `SECRET_KEY`: A secret key utilized for cryptographic functions.
- `ALGORITHM`: The algorithm employed for token encoding.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: The duration for which access tokens remain valid, measured in minutes.
- `ALLOWED_ORIGINS`: A comma-separated list of origins permitted for CORS.
- `OPENAI_API_KEY`: The API key required for accessing OpenAI services.

## Proxy Block

### Nginx Usage
Nginx serves as a reverse proxy server for this application. It processes incoming requests and forwards them to the appropriate backend services. The configuration encompasses:

- **Upstream Server**: Specifies the backend server (FastAPI) that Nginx will interact with.
- **Proxy Settings**: Configures headers and timeouts for requests being proxied to the backend.
- **Static File Handling**: Manages the delivery of static files and addresses specific routes such as `sitemap.xml` and `robots.txt`.

This configuration guarantees that the application is scalable, secure, and efficient in managing web traffic.

### TODOs
1. **# TODO**: Specify your blog-server-domain here; this will direct to the FastAPI server in the Nginx configuration.
2. **# TODO**: Specify your blog-domain here; this is the public endpoint where the login icon will be concealed in the Nginx configuration.
3. **# TODO**: Specify your admin-blog-domain here; this is the private endpoint where the login icon will be visible in the Nginx configuration.

## Setup Process

1. **Setup Postgres Database**:
   - **Option 1**: Utilize Docker Compose if you are operating on a single server.
   - **Option 2**: Bypass the compose file and manually configure the database.

2. **Setup Webserver**:
   - Update the details in the `.env` file, particularly the `DATABASE_URL`.
   - Review the `exec.sh.template` file to determine how to execute FastAPI.
   - **Optional Step**: Establish a Linux SystemD service if you are using Linux for improved management.

3. **Setup Front-end**:
   - Update the details in the `.env` file.
   - **Development Environment**: Execute `npm start` to initiate the front-end server.
   - **Production Environment**: Execute `npm run build`, then link the proxy to the `index.html` file.

4. **Setup Reversed Proxy (Nginx)**:
   - Acquire a domain; CloudFlare is recommended.
   - Direct the domain to the public IP of your network.
   - Update the domain in the reverse proxy configuration file.
   - Patch and apply the Nginx configuration from the `blog.conf.template` file.

5. **HAPPY CODING**