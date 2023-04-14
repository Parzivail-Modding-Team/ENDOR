/** @jsxImportSource theme-ui */

import { ThemeProvider } from 'theme-ui';
import { ConfigProvider, Spin } from 'antd';
import { theme } from './theme';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { useEffect, useState } from 'react';
import { getClient } from './apolloSetup';
import loadable from '@loadable/component';

const Header = loadable(() => import('../components/Header'));
const PostDetail = loadable(() => import('../routes/PostDetail'));
const Browse = loadable(() => import('../routes/Browse'));
const UploadRoute = loadable(() => import('../routes/Upload'));
const Tags = loadable(() => import('../routes/Tags'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Browse />,
  },
  {
    path: '/:id',
    element: <PostDetail />,
  },
  {
    path: '/upload',
    element: <UploadRoute />,
  },
  {
    path: '/tags',
    element: <Tags />,
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
                marginTop: '55px',
              }}
            >
              <RouterProvider router={router} />
            </div>
          </div>
        </ConfigProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
