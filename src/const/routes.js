import Home from '../pages/Home';
import RestAPI from '../pages/RestAPI';
import Team from '../pages/Team';
import Mission from '../pages/Mission';
import Posts from '../pages/Posts';
import RecentPosts from '../pages/RecentPosts';
import PopularPosts from '../pages/PopularPosts';
import Categories from '../pages/Categories';
import Contact from '../pages/Contact';
import APIProtocols from "../pages/APIProtocols";

export const routeStructure = [
  { path: '/', title: 'Home', parent: null, sequence: 1, component: Home },
  { path: '/api-protocol', title: 'API Protocols', parent: null, sequence: 3, component: APIProtocols },
  { path: '/restful-api', title: 'Restful API', parent: "/api-protocol", sequence: 2, component: RestAPI },
  { path: '/team', title: 'Our Team', parent: '/about', sequence: 1, component: Team },
  { path: '/mission', title: 'Our Mission', parent: '/about', sequence: 2, component: Mission },
  { path: '/posts', title: 'Posts', parent: null, sequence: 3, component: Posts },
  { path: '/recent', title: 'Recent Posts', parent: '/posts', sequence: 1, component: RecentPosts },
  { path: '/popular', title: 'Popular Posts', parent: '/posts', sequence: 2, component: PopularPosts },
  { path: '/categories', title: 'Categories', parent: '/posts', sequence: 3, component: Categories },
  { path: '/contact', title: 'Contact', parent: null, sequence: 4, component: Contact }
];
