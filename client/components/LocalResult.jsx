/** @jsxImportSource theme-ui */
import { Result, Typography } from 'antd';

export default function LocalResult({ title, subtitle, status }) {
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
        status={status}
        title={
          <Typography.Title
            level={3}
            style={{
              marginBottom: 0,
            }}
          >
            {title}
          </Typography.Title>
        }
        subTitle={<Typography>{subtitle}</Typography>}
      />
    </div>
  );
}
