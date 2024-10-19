export const routeStructure = [
  { path: '/', title: 'Home', parent: null, sequence: 1 },
  { path: '/restful-api', title: 'Restful API', parent: "api-protocol", sequence: 2 },
  { path: '/team', title: 'Our Team', parent: '/about', sequence: 1 },
  { path: '/mission', title: 'Our Mission', parent: '/about', sequence: 2 },
  { path: '/posts', title: 'Posts', parent: null, sequence: 3 },
  { path: '/recent', title: 'Recent Posts', parent: '/posts', sequence: 1 },
  { path: '/popular', title: 'Popular Posts', parent: '/posts', sequence: 2 },
  { path: '/categories', title: 'Categories', parent: '/posts', sequence: 3 },
  { path: '/contact', title: 'Contact', parent: null, sequence: 4 }
];
