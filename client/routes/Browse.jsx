/** @jsxImportSource theme-ui */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton, Select } from 'antd';
import ImageGrid from '../components/ImageGrid';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GetPosts, GetAllTagLabels } from '../queries';
import LocalResult from '../components/LocalResult';
import _ from 'lodash';
import { TagOutlined } from '@ant-design/icons';
import { notifyGqlFetchError, tagRender } from '../utils';

function getQuery(searchParams) {
  const query = searchParams.get('q');
  if (!query) {
    return [];
  }
  return query.split('+').map((s) => decodeURI(s));
}

function setQuery(setSearchParams, query) {
  setSearchParams(
    query && query.length > 0
      ? {
          q: query.map((s) => encodeURI(s)).join('+'),
        }
      : {}
  );
}

export default function Browse() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const [getPosts] = useLazyQuery(GetPosts, {
    onCompleted: (data) => {
      setPosts(data.getPosts);
      setLoading(false);
    },
    onError: ({ graphQLErrors }) => {
      notifyGqlFetchError(graphQLErrors, 'posts');
      setLoading(false);
    },
  });

  useQuery(GetAllTagLabels, {
    onCompleted: (data) => {
      setTags(data.getAllTagLabels);
    },
    onError: ({ graphQLErrors }) => {
      notifyGqlFetchError(graphQLErrors, 'tags');
    },
  });

  useEffect(() => {
    getPosts({
      variables: { tags: getQuery(searchParams) },
    });
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
            style={{
              width: '100%',
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
              const tags = e.map((item) => item.value);
              setQuery(setSearchParams, tags);
              getPosts({
                variables: { tags },
              });
            }}
            notFoundContent={null}
            options={tags}
            defaultValue={getQuery(searchParams)}
            maxTagCount="responsive"
            optionFilterProp="label"
            fieldNames={{ value: 'label' }}
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
