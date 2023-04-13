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
const Home = loadable(() => import('../routes/Home'));
const PostDetail = loadable(() => import('../routes/PostDetail'));
const Browse = loadable(() => import('../routes/Browse'));
const UploadRoute = loadable(() => import('../routes/Upload'));
const Tags = loadable(() => import('../routes/Tags'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/:id',
    element: <PostDetail />,
  },
  {
    path: '/browse',
    element: <Browse />,
  },
  {
    path: '/browse/:id',
    element: <Browse />,
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
              colorPrimary: '#389e0d',
            },
          }}
        >
          <div
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: '1rem',
            }}
          >
            <Header />
            <div
              sx={{
                display: 'flex',
                width: '100%',
                height: '100%',
                padding: '1rem',
                backgroundColor: 'white',
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
