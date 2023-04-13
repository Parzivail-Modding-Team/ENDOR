/** @jsxImportSource theme-ui */

import { Result } from 'antd';

export default function LocalResult({ title, subtitle }) {
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
      <Result status={404} title={title} subTitle={subtitle} />
    </div>
  );
}
