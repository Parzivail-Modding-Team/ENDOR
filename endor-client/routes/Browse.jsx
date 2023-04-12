/** @jsxImportSource theme-ui */

import { useState, useEffect } from 'react';
import { Radio, Result, Skeleton, Spin } from 'antd';
import ImageGrid from '../components/ImageGrid';
import { IconColumns1, IconColumns2, IconColumns3 } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GetPosts } from '../queries';
import TagSelect from '../components/TagSelect';

export default function Browse() {
  const [search, setSearch] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gridSize, setGridSize] = useState(localStorage.getItem('gridSize'));
  const location = useLocation();
  const navigate = useNavigate();

  // Search support
  const { loading, error } = useQuery(GetPosts, {
    onCompleted: (data) => {
      setPosts(data.getPosts);
    },
    onError: () => {
      message.error('There was a problem fetching the post');
    },
  });

  useEffect(() => {
    if (location.search && location.search.length > 0) {
      setSearch(location.search.substring(1).split('+'));
    }
  }, [location]);

  useEffect(() => {
    if (!localStorage.getItem('gridSize')) {
      localStorage.setItem('gridSize', '350px');
    }
    setGridSize(localStorage.getItem('gridSize'));
  }, []);

  useEffect(() => {
    if (!gridSize) {
      return;
    }
    localStorage.setItem('gridSize', gridSize);
  }, [gridSize]);

  return (
    <div
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        sx={{
          display: 'flex',
          width: '100%',
          height: 'fit-content',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          sx={{
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TagSelect
            value={search}
            onClick={() =>
              navigate({ pathname: '/browse', search: search.join('+') })
            }
            onChange={setSearch}
          />
        </div>
        <Radio.Group
          value={gridSize}
          buttonStyle="solid"
          onChange={(e) => setGridSize(e.target.value)}
        >
          <Radio.Button
            value="500px"
            style={{
              height: 'fit-content',
              margin: 0,
              padding: '0.35rem 0.65rem',
              lineHeight: '10px',
            }}
          >
            <IconColumns1 size={20} />
          </Radio.Button>
          <Radio.Button
            value="350px"
            style={{
              height: 'fit-content',
              margin: 0,
              padding: '0.35rem 0.65rem',
              lineHeight: '10px',
            }}
          >
            <IconColumns2 size={20} />
          </Radio.Button>
          <Radio.Button
            value="250px"
            style={{
              height: 'fit-content',
              margin: 0,
              padding: '0.35rem 0.65rem',
              lineHeight: '10px',
            }}
          >
            <IconColumns3 size={20} />
          </Radio.Button>
        </Radio.Group>
      </div>
      {!posts ? (
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
            title="No Posts"
            subTitle="We could not find any posts, please try again or create a new post."
          />
        </div>
      ) : loading ? (
        <div
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '1rem',
            width: '100%',
            height: 'auto',
          }}
        >
          <Skeleton.Image
            active
            style={{
              width: '100%',
              height: 'auto',
              padding: '40%',
            }}
          />
          <Skeleton.Image
            active
            style={{
              width: '100%',
              height: 'auto',
              padding: '40%',
            }}
          />
          <Skeleton.Image
            active
            style={{
              width: '100%',
              height: 'auto',
              padding: '40%',
            }}
          />
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
        </div>
      ) : (
        <ImageGrid gridSize={gridSize} data={posts} />
      )}
    </div>
  );
}
