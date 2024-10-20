import RestAPI from '../pages/RestAPI';
import About from '../pages/About';
import Categories from '../pages/Categories';
import Contact from '../pages/Contact';
import Mission from '../pages/Mission';

const routes = [
  { path: '/rest-api', component: RestAPI, exact: true },
  { path: '/about', component: About, exact: true },
  { path: '/categories', component: Categories, exact: true },
  { path: '/contact', component: Contact, exact: true },
  { path: '/mission', component: Mission, exact: true },
];

export default routes;
