/** @jsxImportSource theme-ui */
import { ThemeProvider } from 'theme-ui';
import { ConfigProvider, Spin } from 'antd';
import { theme } from './theme';
import Header from '../components/Header';
import Home from '../routes/Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PostDetail from '../routes/PostDetail';
import Browse from '../routes/Browse';
import { UploadRoute } from '../routes/Upload';
import { ApolloProvider } from '@apollo/client';
import { useEffect, useState } from 'react';
import { getClient } from './apolloSetup';

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
