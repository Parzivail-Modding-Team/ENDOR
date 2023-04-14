/** @jsxImportSource theme-ui */

import { useState, useEffect, useCallback } from 'react';
import { Radio, Skeleton, Select, message } from 'antd';
import ImageGrid from '../components/ImageGrid';
import { IconColumns1, IconColumns2, IconColumns3 } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GetPosts, GetTags } from '../queries';
import LocalResult from '../components/LocalResult';
import { useColorMode } from 'theme-ui';
import _ from 'lodash';
import { theme } from '../src/theme';
import { TagOutlined } from '@ant-design/icons';
import { tagRender } from '../utils';

export default function Browse() {
  const [search, setSearch] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gridSize, setGridSize] = useState(localStorage.getItem('gridSize'));
  const [tags, setTags] = useState([]);
  const [colorMode] = useColorMode();

  const location = useLocation();
  const navigate = useNavigate();

  const [getPosts, { loading }] = useLazyQuery(GetPosts, {
    onCompleted: (data) => {
      setPosts(data.getPosts);
    },
    onError: () => {
      message.error('There was a problem fetching the post');
    },
  });

  useQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  const postDebouncer = useCallback(_.debounce(getPosts, 200), []);

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

    if (localStorage.getItem('search')) {
      const properSearch = JSON.parse(localStorage.getItem('search'));
      setSearch(properSearch);
      getPosts({
        variables: { tags: properSearch },
      });
    }
  }, []);

  useEffect(() => {
    if (!gridSize) {
      return;
    }
    localStorage.setItem('gridSize', gridSize);
  }, [gridSize]);

  useEffect(() => {
    getPosts();
  }, []);

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
          display: 'grid',
          width: '100%',
          height: 'fit-content',
          alignItems: 'flex-end',
          gridTemplateColumns: '1fr auto',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Select
            mode="multiple"
            allowClear
            className={colorMode === 'light' ? 'light-input' : 'dark-input'}
            style={{
              width: '100%',
            }}
            popupClassName={colorMode === 'light' ? 'light-drop' : 'dark-drop'}
            dropdownStyle={{
              backgroundColor:
                colorMode === 'dark' && theme.colors.modes.dark.input,
            }}
            placeholder={
              <div
                sx={{
                  height: 'fit-content',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TagOutlined
                  className="site-form-item-icon"
                  style={{ marginRight: '0.5rem' }}
                />
                Ex. landspeeder
              </div>
            }
            tagRender={tagRender}
            onChange={(e) => {
              postDebouncer({
                variables: { tags: e.map((item) => item.value) },
              });
              setSearch(e);
              localStorage.setItem(
                'search',
                JSON.stringify(e.map((item) => item.value))
              );
            }}
            notFoundContent={null}
            options={tags}
            value={search}
            maxTagCount="responsive"
            optionFilterProp="label"
            fieldNames={{ value: '_id' }}
            labelInValue
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
