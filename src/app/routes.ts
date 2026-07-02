import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { Auth } from './components/Auth';
import { HomeMap } from './components/HomeMap';
import { Timeline } from './components/Timeline';
import { PostExpanded } from './components/PostExpanded';
import { NewMemory } from './components/NewMemory';
import { SearchPage } from './components/SearchPage';
import { ProfilePage } from './components/ProfilePage';
import { NotificationsPage } from './components/NotificationsPage';
import { AdminPanel } from './components/AdminPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Auth,
  },
  {
    path: '/app',
    Component: Root,
    children: [
      { index: true, Component: HomeMap },
      { path: 'timeline', Component: Timeline },
      { path: 'timeline/:locationId', Component: Timeline },
      { path: 'post/:postId', Component: PostExpanded },
      { path: 'new-memory', Component: NewMemory },
      { path: 'search', Component: SearchPage },
      { path: 'profile/:userId', Component: ProfilePage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'admin', Component: AdminPanel },
    ],
  },
]);
