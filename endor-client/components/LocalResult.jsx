/** @jsxImportSource theme-ui */

import { Result, Typography } from 'antd';
import { useColorMode } from 'theme-ui';
import { theme } from '../src/theme';

export default function LocalResult({ title, subtitle }) {
  const [colorMode] = useColorMode();

  return (
    <div
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Result
        status={404}
        title={
          <Typography.Title
            level={3}
            style={{
              color:
                colorMode === 'light'
                  ? theme.colors.text
                  : theme.colors.modes.dark.text,
              marginBottom: 0,
            }}
          >
            {title}
          </Typography.Title>
        }
        subTitle={
          <Typography
            style={{
              color:
                colorMode === 'light'
                  ? theme.colors.text
                  : theme.colors.modes.dark.text,
            }}
          >
            {subtitle}
          </Typography>
        }
      />
    </div>
  );
}
