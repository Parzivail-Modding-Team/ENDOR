/** @jsxImportSource theme-ui */
import { useNavigate } from 'react-router-dom';
import six from '../assets/6.png';

function GridItem({ item, gridSize }) {
  const navigate = useNavigate();

  return (
    <div
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
      onClick={() => {
        navigate(`/${item._id}`);
      }}
    >
      <img
        src={item.src || six}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      />
    </div>
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
