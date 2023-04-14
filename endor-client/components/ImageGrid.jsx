/** @jsxImportSource theme-ui */
import { LazyLoadImage } from 'react-lazy-load-image-component';

function GridItem({ item, gridSize }) {
  return (
    <a
      sx={{
        height:
          gridSize === '500px'
            ? '350px'
            : gridSize === '350px'
            ? '250px'
            : '175px',
        width: '100%',
      }}
      className="grid-item"
      href={`/${item._id}`}
    >
      <LazyLoadImage
        src={item.imageUrl}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      />
    </a>
  );
}

export default function ImageGrid({ gridSize, data }) {
  return (
    <div
      sx={{
        display: 'flex',
        width: '100%',
        height: 'fit-content',
        flexDirection: 'column',
      }}
    >
      <div
        className="grid-root"
        sx={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${gridSize}, 1fr))`,
        }}
      >
        {data.map((item) => (
          <GridItem item={item} key={item._id} gridSize={gridSize} />
        ))}
      </div>
    </div>
  );
}
