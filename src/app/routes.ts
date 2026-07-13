import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import AuthPage from './pages/auth/page';
import { HomeMap } from './pages/HomeMap';
import { Timeline } from './pages/Timeline';
import { PostExpanded } from './pages/PostExpanded';
import { NewMemory } from './pages/NewMemory';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPanel } from './pages/AdminPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AuthPage,
  },
  {
    path: '/app',
    Component: Layout,
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
