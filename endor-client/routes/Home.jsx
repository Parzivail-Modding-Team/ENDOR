/** @jsxImportSource theme-ui */

import { Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedText from '../components/AnimatedText';
import TagSelect from '../components/TagSelect';

export default function Home() {
  const [search, setSearch] = useState([]);

  const navigate = useNavigate();

  return (
    <div
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        sx={{
          height: 'fit-content',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <div
          sx={{
            height: 'fit-content',
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Typography.Title
            level={2}
            style={{ fontFamily: 'Gloock', margin: 0, marginRight: '0.4rem' }}
          >
            Search for
          </Typography.Title>
        </div>
        <AnimatedText />
      </div>
      <div
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div sx={{ width: '60%' }}>
          <TagSelect
            value={search}
            onClick={() =>
              navigate({ pathname: '/browse', search: search.join('+') })
            }
            onChange={setSearch}
          />
        </div>
      </div>
    </div>
  );
}
