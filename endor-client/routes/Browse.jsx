/** @jsxImportSource theme-ui */

import { useState, useEffect } from 'react';
import { Radio, Skeleton } from 'antd';
import ImageGrid from '../components/ImageGrid';
import { IconColumns1, IconColumns2, IconColumns3 } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GetPosts } from '../queries';
import TagSelect from '../components/TagSelect';
import LocalResult from '../components/LocalResult';

export default function Browse() {
  const [search, setSearch] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gridSize, setGridSize] = useState(localStorage.getItem('gridSize'));
  const location = useLocation();
  const navigate = useNavigate();

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
      {loading && (
        <div
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      )}
      {!loading && !posts.length ? (
        <LocalResult
          title="No Posts"
          subTitle="We could not find any posts, please try again or create a new post."
        />
      ) : (
        <ImageGrid gridSize={gridSize} data={posts} />
      )}
    </div>
  );
}
