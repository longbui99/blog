import RestAPI from './pages/RestAPI';

const routes = [
  { id: 'home', content: 'Home', path: '/' },
  { id: 'api-protocol', content: 'API Protocol', path: '/api-protocol', children: [
    { id: 'restful-api', content: 'Restful API', path: '/restful-api', element: <RestAPI /> },
    { id: 'mission', content: 'Our Mission', path: '/mission' },
  ]},
  { id: 'posts', content: 'Posts', path: '/posts', children: [
    { id: 'recent', content: 'Recent Posts', path: '/recent' },
    { id: 'popular', content: 'Popular Posts', path: '/popular' },
    { id: 'categories', content: 'Categories', path: '/categories' },
  ]},
  { id: 'contact', content: 'Contact', path: '/contact' }
];

export default routes;
