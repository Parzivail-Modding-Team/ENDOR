/** @jsxImportSource theme-ui */

import { useState, useEffect } from 'react';
import { Typography, Menu } from 'antd';
import {
  EyeInvisibleTwoTone,
  EyeTwoTone,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useColorMode } from 'theme-ui';
import { theme } from '../src/theme';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [colorMode, setColorMode] = useColorMode();

  useEffect(() => {
    window.onscroll = function () {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
  }, [window.scrollY]);

  console.log(location.pathname);

  return (
    <div
      sx={{
        height: '55px',
        width: '100%',
        backgroundColor: 'background',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        transition: 'background 0.3s,width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
        boxShadow: scrolled ? '0 1px 10px 1px rgba(0, 0, 0, 0.12)' : 'none',
        top: 0,
        zIndex: 999,
      }}
    >
      <Menu
        selectedKeys={location.pathname}
        style={{
          width: '100%',
          backgroundColor:
            colorMode === 'light'
              ? theme.colors.background
              : theme.colors.modes.dark.background,
        }}
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
                    transition:
                      'background 0.3s,width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
                    color:
                      colorMode === 'light'
                        ? theme.colors.text
                        : theme.colors.modes.dark.text,
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
        selectedKeys={location.pathname || null}
        style={{
          backgroundColor:
            colorMode === 'light'
              ? theme.colors.background
              : theme.colors.modes.dark.background,
        }}
        mode="horizontal"
        items={[
          {
            label: (
              <a
                style={{
                  textDecoration: 'none',
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
                href="/upload"
              >
                Upload
              </a>
            ),
            key: '/upload',
            icon: (
              <PlusOutlined
                style={{
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
              />
            ),
          },
          {
            label: (
              <a
                style={{
                  textDecoration: 'none',
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
                href="/tags"
              >
                Tags
              </a>
            ),
            key: '/tags',
            icon: (
              <TagOutlined
                style={{
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
              />
            ),
          },
          {
            label: (
              <a
                style={{
                  textDecoration: 'none',
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
                href="https://discord.com/api/oauth2/authorize?client_id=1084227425220698262&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth&response_type=code&scope=identify"
              >
                Login
              </a>
            ),
            icon: (
              <UserOutlined
                style={{
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
              />
            ),
          },
          {
            label:
              colorMode === 'light' ? (
                <EyeTwoTone
                  twoToneColor={theme.colors.text}
                  style={{ height: '100%', width: '100%' }}
                  onClick={() =>
                    setColorMode(colorMode === 'light' ? 'dark' : 'light')
                  }
                />
              ) : (
                <EyeInvisibleTwoTone
                  twoToneColor={theme.colors.modes.dark.text}
                  style={{ height: '100%', width: '100%' }}
                  onClick={() =>
                    setColorMode(colorMode === 'light' ? 'dark' : 'light')
                  }
                />
              ),
          },
        ]}
      />
    </div>
  );
}
