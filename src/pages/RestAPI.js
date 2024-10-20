import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page.css';
import { parseContent } from '../utils/contentParser';

function RestAPI() {
    const [content, setContent] = useState(null);
    const location = useLocation();

    useEffect(() => {
        
const htmlContent = `
            
<h1>REST API: Fundamental Knowledge to FastAPI Example</h1>

<h2>1. Introduction to REST APIs</h2>
<p><strong>REST (Representational State Transfer)</strong> is an architectural style used to design networked applications. RESTful APIs expose services or resources that clients such as web browsers, mobile apps, or other servers can access over HTTP.</p>

<h3>Key Principles of REST:</h3>
<ul>
    <li><strong>Statelessness</strong>: The server does not store any state between requests. Each client request must contain all the information the server needs.</li>
    <li><strong>Client-Server Separation</strong>: The client interacts with the server via a uniform interface without needing to know the server’s inner workings.</li>
    <li><strong>Uniform Interface</strong>: Operations on resources are carried out through standard HTTP methods (GET, POST, PUT, DELETE).</li>
    <li><strong>Resource-Based</strong>: Everything is a resource and identified by a URI.</li>
    <li><strong>Representation</strong>: Resources are transferred as representations, usually in JSON format.</li>
    <li><strong>Stateless Communication</strong>: Each request and response are independent and must include all necessary data.</li>
</ul>

<h2>2. HTTP Methods in REST API</h2>
<p>RESTful APIs use the following HTTP methods to operate on resources:</p>
<ul>
    <li><strong>GET</strong>: Retrieve data from the server (read-only).</li>
    <li><strong>POST</strong>: Send data to the server, typically for creating new resources.</li>
    <li><strong>PUT</strong>: Update or replace an existing resource.</li>
    <li><strong>PATCH</strong>: Partially update a resource.</li>
    <li><strong>DELETE</strong>: Remove a resource.</li>
</ul>

<h2>3. JSON Format in REST APIs</h2>
<p>REST APIs often return data in <strong>JSON (JavaScript Object Notation)</strong> format, which is lightweight and easy for humans to read and for machines to parse.</p>
<pre><code>
{
"id": 1,
"name": "John Doe",
"email": "john.doe@example.com"
}
</code></pre>

<h2>4. Steps to Design a REST API</h2>

<h3>4.1 Define Resources</h3>
<p>Identify the resources in your application, such as users, products, or orders. Each resource is represented by a URI.</p>

<h3>4.2 Design Endpoints</h3>
<ul>
    <li><strong>Base URI</strong>: This is the root of your API, such as <code>/api/v1/</code>.</li>
    <li><strong>Resource URIs</strong>: Each resource has an endpoint, like <code>/users</code> for users or <code>/orders</code> for orders.</li>
</ul>

<h3>4.3 HTTP Methods for Endpoints</h3>
<ul>
    <li><code>GET /users</code>: Fetch all users.</li>
    <li><code>POST /users</code>: Create a new user.</li>
    <li><code>GET /users/{id}</code>: Fetch a specific user by ID.</li>
    <li><code>PUT /users/{id}</code>: Update a specific user.</li>
    <li><code>DELETE /users/{id}</code>: Remove a specific user.</li>
</ul>

<h3>4.4 Status Codes</h3>
<ul>
    <li><strong>200 OK</strong>: Request succeeded.</li>
    <li><strong>201 Created</strong>: New resource created.</li>
    <li><strong>400 Bad Request</strong>: Invalid request.</li>
    <li><strong>404 Not Found</strong>: Resource not found.</li>
    <li><strong>500 Internal Server Error</strong>: A server error occurred.</li>
</ul>

<h3>4.5 Versioning</h3>
<p>Add versioning to your API URIs, like <code>/api/v1/users</code>, to prevent breaking changes when the API evolves.</p>

<h2>5. Introduction to FastAPI</h2>
<p><strong>FastAPI</strong> is a high-performance Python web framework designed for building APIs. It supports asynchronous programming, automatic data validation, and interactive documentation.</p>

<h3>Key Features of FastAPI:</h3>
<ul>
    <li><strong>High Performance</strong>: One of the fastest frameworks in Python.</li>
    <li><strong>Asynchronous</strong>: Supports <code>async</code> and <code>await</code>.</li>
    <li><strong>Data Validation</strong>: Uses Python type hints and Pydantic for data validation.</li>
    <li><strong>Interactive Documentation</strong>: Generates documentation with Swagger and ReDoc automatically.</li>
</ul>

<h2>6. Implementing a REST API with FastAPI</h2>

<h3>6.1 Install FastAPI and Uvicorn</h3>
<pre><code>pip install fastapi
pip install uvicorn</code></pre>

<h3>6.2 Create a FastAPI App</h3>
<p>Create a file <code>main.py</code> with the following code:</p>
<pre><code>
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class User(BaseModel):
id: Optional[int] = None
name: str
email: str

users = []

@app.get("/users")
def get_users():
return users

@app.post("/users", status_code=201)
def create_user(user: User):
user.id = len(users) + 1
users.append(user)
return user

@app.get("/users/{user_id}")
def get_user(user_id: int):
for user in users:
    if user.id == user_id:
        return user
return {"error": "User not found"}

@app.put("/users/{user_id}")
def update_user(user_id: int, updated_user: User):
for idx, user in enumerate(users):
    if user.id == user_id:
        users[idx] = updated_user
        users[idx].id = user_id
        return users[idx]
return {"error": "User not found"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
for idx, user in enumerate(users):
    if user.id == user_id:
        users.pop(idx)
        return {"message": "User deleted successfully"}
return {"error": "User not found"}
</code></pre>

<h3>6.3 Run the FastAPI App</h3>
<pre><code>uvicorn main:app --reload</code></pre>

<h3>6.4 Access the API and Documentation</h3>
<ul>
    <li>API: <code>http://127.0.0.1:8000</code></li>
    <li>Swagger UI: <code>http://127.0.0.1:8000/docs</code></li>
    <li>ReDoc: <code>http://127.0.0.1:8000/redoc</code></li>
</ul>

<h2>7. Best Practices for Designing REST API Endpoints</h2>

<h3>7.1 Use Nouns in URIs</h3>
<p>URIs should use nouns to represent resources:</p>
<ul>
    <li><strong>Good</strong>: <code>/users</code></li>
    <li><strong>Bad</strong>: <code>/getUsers</code></li>
</ul>

<h3>7.2 Use Plural Nouns for Collections</h3>
<p>For resources that represent a collection of objects, use plural nouns:</p>
<ul>
    <li><strong>Good</strong>: <code>/users</code></li>
    <li><strong>Bad</strong>: <code>/user</code></li>
</ul>

<h3>7.3 Consistent Naming Conventions</h3>
<p>Be consistent with naming conventions across your API:</p>
<ul>
    <li>Use lowercase letters and hyphens, like <code>/user-details</code>.</li>
    <li>Avoid camelCase or snake_case in URIs.</li>
</ul>

<h2>Conclusion</h2>
<p>REST APIs are a foundational component of modern web and mobile applications. Understanding key concepts and adhering to best practices is critical to building scalable, maintainable, and efficient APIs. FastAPI offers a streamlined way to implement REST APIs in Python, ensuring high performance and ease of use.</p>

    `;

        const parsedContent = parseContent(htmlContent, location.pathname);
        setContent(parsedContent);
    }, [location.pathname]);

    if (!content) {
        return <div>Loading...</div>;
    }

    return (
        <div className="content-wrapper">
            {content}
        </div>
    );
}

export default RestAPI;
