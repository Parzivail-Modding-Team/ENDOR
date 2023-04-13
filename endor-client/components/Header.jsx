/** @jsxImportSource theme-ui */

import { useState, useEffect } from 'react';
import { Button, Typography, Menu } from 'antd';
import { PlusOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.onscroll = function () {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
  }, [window.scrollY]);

  return (
    <div
      sx={{
        height: '55px',
        width: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        transition: '0.2s ease all',
        boxShadow: scrolled ? '0 1px 10px 1px rgba(0, 0, 0, 0.12)' : 'none',
        top: 0,
        zIndex: 999,
      }}
    >
      <Menu
        selectedKeys={location.pathname.substring()}
        style={{ width: '100%' }}
        mode="horizontal"
        items={[
          {
            label: (
              <a href="/" style={{ textDecoration: 'none' }}>
                <Typography.Title
                  level={2}
                  style={{
                    margin: 0,
                    paddingTop: '2px',
                    paddingBottom: '7px',
                    fontFamily: 'Gloock',
                    cursor: 'pointer',
                  }}
                >
                  ENDOR
                </Typography.Title>
              </a>
            ),
            key: '/',
          },
        ]}
      />
      <Menu
        selectedKeys={location.pathname.substring(1)}
        mode="horizontal"
        items={[
          {
            label: (
              <a style={{ textDecoration: 'none' }} href="/upload">
                Upload
              </a>
            ),
            key: 'upload',
            icon: <PlusOutlined />,
          },
          {
            label: (
              <a style={{ textDecoration: 'none' }} href="/tags">
                Tags
              </a>
            ),
            key: 'tags',
            icon: <TagOutlined />,
          },
          {
            label: (
              <a
                style={{ textDecoration: 'none' }}
                href="https://discord.com/api/oauth2/authorize?client_id=1084227425220698262&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth&response_type=code&scope=identify"
              >
                Login
              </a>
            ),
            icon: <UserOutlined />,
          },
        ]}
      />
    </div>
  );
}
