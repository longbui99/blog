import React from 'react';
import { parseContent } from '../utils/contentParser';

function APIProtocols() {
  const content = `
    <h1>API Protocols</h1>
    <p>API protocols are sets of rules that govern how software components should interact. They define the methods and data structures used for communication between different parts of a distributed system.</p>

    <h2>Common API Protocols</h2>
    <ul>
      <li><a href="/restful-api">RESTful API</a> - Representational State Transfer</li>
      <li>SOAP - Simple Object Access Protocol</li>
      <li>GraphQL - Query language for APIs</li>
      <li>gRPC - High performance, open-source universal RPC framework</li>
    </ul>

    <h2>Key Concepts in API Protocols</h2>
    <ol>
      <li><strong>Request-Response Model</strong>: Most API protocols follow this model where a client sends a request and the server responds.</li>
      <li><strong>Data Format</strong>: APIs typically use standard data formats like JSON or XML for data exchange.</li>
      <li><strong>Authentication</strong>: Protocols often include methods for verifying the identity of the client making the request.</li>
      <li><strong>Statelessness</strong>: Many modern API protocols, like REST, are stateless, meaning each request contains all the information needed to complete it.</li>
    </ol>

    <h2>Choosing an API Protocol</h2>
    <p>The choice of API protocol depends on various factors including:</p>
    <ul>
      <li>The type of application you're building</li>
      <li>Performance requirements</li>
      <li>Ease of use and developer experience</li>
      <li>Compatibility with existing systems</li>
    </ul>

    <p>Explore our detailed guides on specific API protocols to learn more about their characteristics, advantages, and best use cases.</p>
  `;

  return <div className="content-wrapper">{parseContent(content)}</div>;
}

export default APIProtocols;
