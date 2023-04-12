/** @jsxImportSource theme-ui */
import { useNavigate } from 'react-router-dom';

function GridItem({ item, gridSize }) {
  const navigate = useNavigate();

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
      <img
        src={item.imageUrl}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          borderRadius: '2px',
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
