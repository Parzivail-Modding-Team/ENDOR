/** @jsxImportSource theme-ui */
import { LazyLoadImage } from 'react-lazy-load-image-component';

function GridItem({ item, itemsLength }) {
  return (
    <a
      sx={{
        height: itemsLength === 1 || itemsLength === 2 ? '100%' : '250px',
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

export default function ImageGrid({ data }) {
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
          gridTemplateColumns: `repeat(auto-fit, minmax(350px, 1fr))`,
        }}
      >
        {data.map((item) => (
          <GridItem item={item} key={item._id} itemsLength={data.length} />
        ))}
      </div>
    </div>
  );
}
