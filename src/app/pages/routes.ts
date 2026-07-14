import { createBrowserRouter } from 'react-router';
import { Layout } from '../layout';
import { HomeMap } from './HomeMap';
import { Timeline } from './Timeline';
import { PostExpanded } from './PostExpanded';
import { NewMemory } from './NewMemory';
import { SearchPage } from './SearchPage';
import { ProfilePage } from './ProfilePage';
import { NotificationsPage } from './NotificationsPage';
import { AdminPanel } from './AdminPanel';

import AuthPage from './auth/page';

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
