/** @jsxImportSource theme-ui */
import { useState, useEffect, useCallback } from 'react';
import { Skeleton, Select, message } from 'antd';
import ImageGrid from '../components/ImageGrid';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GetPosts, GetTags, GetUser } from '../queries';
import LocalResult from '../components/LocalResult';
import { useColorMode } from 'theme-ui';
import _ from 'lodash';
import { theme } from '../theme';
import { TagOutlined } from '@ant-design/icons';
import { tagRender } from '../utils';

export default function Browse() {
  const [search, setSearch] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [colorMode] = useColorMode();
  const [loading, setLoading] = useState(true);

  const [getPosts] = useLazyQuery(GetPosts, {
    onCompleted: (data) => {
      setPosts(data.getPosts);
      setLoading(false);
    },
    onError: ({ graphQLErrors }) => {
      if (graphQLErrors) {
        setLoading(false);
        message.error(graphQLErrors[0].message);
      }
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
    if (localStorage.getItem('search')) {
      const properSearch = JSON.parse(localStorage.getItem('search'));
      if (properSearch && properSearch.length) {
        setSearch(properSearch);
        getPosts({
          variables: { tags: properSearch },
        });
      } else {
        getPosts();
      }
    } else {
      getPosts();
    }
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
          display: 'flex',
          width: '100%',
          height: 'fit-content',
          alignItems: 'center',
          marginBottom: '1rem',
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
            tagRender={(e) => tagRender(e, false)}
            onChange={(e) => {
              if (e.length == 0) {
                getPosts();
                localStorage.removeItem('search');
              }
              if (localStorage.getItem('search')) {
                postDebouncer({
                  variables: { tags: e.map((item) => item.value) },
                });
              }
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
      </div>
      {loading && (
        <div
          sx={{
            display: 'grid',
            height: '100%',
            width: '100%',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr',
            gap: '1rem',
          }}
        >
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
          <Skeleton.Image
            active
            style={{ width: '100%', height: 'auto', padding: '40%' }}
          />
        </div>
      )}
      {!loading && (!posts.length || posts.length === 0) ? (
        <LocalResult
          title="No Posts"
          subtitle="We could not find any posts, please try again or create a new post."
          status={404}
        />
      ) : (
        <ImageGrid data={posts} />
      )}
    </div>
  );
}
