/** @jsxImportSource theme-ui */
import { Divider, Skeleton } from 'antd';

export default function ImageSkeleton() {
  return (
    <div
      sx={{
        display: 'flex',
        height: 'fit-content',
        width: '100%',
        flexWrap: 'nowrap',
      }}
    >
      <Skeleton.Image
        active
        style={{ width: '40vw', height: 'auto', padding: '40%' }}
      />
      <div
        sx={{
          display: 'flex',
          height: 'fit-content',
          width: '100%',
          marginTop: '1rem',
          padding: '0 1rem',
          flexDirection: 'column',
        }}
      >
        <Skeleton active />
        <Divider style={{ margin: '0.5rem 0rem 0.9rem 0rem' }} />

        <Skeleton active />
      </div>
    </div>
  );
}
