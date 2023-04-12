/** @jsxImportSource theme-ui */

import { Divider, Skeleton } from 'antd';

export default function ImageSkeleton() {
  return (
    <div
      sx={{
        display: 'flex',
        height: 'fit-content',
        width: '100%',
        flexWrap: 'wrap',
        '@media screen and (min-width: 750px)': {
          flexWrap: 'nowrap',
        },
      }}
    >
      <div
        sx={{
          display: 'flex',
          height: 'fit-content',
          width: 'fit-content',
        }}
      >
        <Skeleton.Image
          active
          style={{ width: '40vw', height: 'auto', padding: '40%' }}
        />
      </div>

      {/* Tags */}
      <div
        sx={{
          display: 'flex',
          height: 'fit-content',
          width: '100%',
          marginTop: '1rem',
          padding: 0,
          '@media screen and (min-width: 750px)': {
            width: '60%',
            padding: '0 1rem',
            marginTop: 0,
          },
          flexDirection: 'column',
        }}
      >
        <Skeleton active />
        <Divider style={{ margin: '0.5rem 0rem 0.9rem 0rem' }} />
        <div
          sx={{
            display: 'flex',
            height: 'fit-content',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          <Skeleton active />
        </div>
        <Divider style={{ margin: '0.4rem 0rem 0.5rem 0rem' }} />
        {/* <RowItem title="Author:" content={post.author.sub} /> */}
        <Skeleton active />
      </div>
    </div>
  );
}
