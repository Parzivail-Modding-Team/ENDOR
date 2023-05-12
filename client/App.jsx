/** @jsxImportSource theme-ui */
import { ThemeProvider } from 'theme-ui';
import { ConfigProvider, Spin } from 'antd';
import { theme } from './theme';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { useEffect, useState } from 'react';
import { getClient } from './apolloSetup';
import loadable from '@loadable/component';
import { AuthContextProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { Role } from './utils';

const Header = loadable(() => import('./components/Header'));
const PostDetail = loadable(() => import('./routes/PostDetail'));
const Browse = loadable(() => import('./routes/Browse'));
const UploadRoute = loadable(() => import('./routes/Upload'));
const Tags = loadable(() => import('./routes/Tags'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute role={Role.ReadOnly}>
        <Browse />
      </ProtectedRoute>
    ),
  },
  {
    path: '/:id',
    element: (
      <ProtectedRoute role={Role.ReadOnly}>
        <PostDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/upload',
    element: (
      <ProtectedRoute role={Role.ReadWrite}>
        <UploadRoute />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tags',
    element: (
      <ProtectedRoute role={Role.ReadWrite}>
        <Tags />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const [client, setClient] = useState();

  async function setup() {
    setClient(await getClient());
  }

  useEffect(() => {
    setup();
  }, []);

  if (!client) return <Spin />;
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AuthContextProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: theme.colors.primary,
              },
            }}
          >
            <div
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background',
                paddingBottom: '1rem',
                transition:
                  'background 0.3s,width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
              }}
            >
              <Header />
              <div
                sx={{
                  display: 'flex',
                  width: '100%',
                  height: 'fit-content',
                  padding: '1rem',
                  backgroundColor: 'background',
                  transition:
                    'background 0.3s,width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
                  marginTop: '55px',
                }}
              >
                <RouterProvider router={router} />
              </div>
            </div>
          </ConfigProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
