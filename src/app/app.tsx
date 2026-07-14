import { RouterProvider } from 'react-router';
import { router } from './pages/routes';
import { AppProvider } from './AppContext';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}