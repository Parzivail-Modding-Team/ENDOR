/** @jsxImportSource theme-ui */
import { Divider, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { GetPostDetails } from '../queries';
import ImageSkeleton from '../components/ImageSkeleton';
import { LazyLoadImage } from 'react-lazy-load-image-component';

function RowItem({ title, content }) {
  return (
    <div
      sx={{
        display: 'flex',
        width: '100%',
        height: 'fit-content',
        alignItems: 'center',
      }}
    >
      <Typography.Text style={{ margin: 0, marginRight: '0.5rem' }} strong>
        {title}
      </Typography.Text>
      <Typography.Text style={{ margin: 0 }} type="secondary" italic>
        {content}
      </Typography.Text>
    </div>
  );
}

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [editing, setEditing] = useState(false);

  const location = useLocation();

  const { loading, error } = useQuery(GetPostDetails, {
    variables: { _id: location.pathname.substring(1) },
    onCompleted: (data) => {
      setPost(data.getPosts[0]);
    },
    onError: () => {
      message.error('There was a problem fetching the post');
    },
  });

  if (loading) {
    return <ImageSkeleton />;
  }

  // TODO: add media query for flex wrap
  return (
    <div
      sx={{
        display: 'flex',
        height: 'fit-content',
        width: '100%',
        flexWrap: 'wrap',
        '@media screen and (min-width: 750px)': {
          flexWrap: 'nowrap',
        },
      }}
    >
      <div
        sx={{
          display: 'flex',
          height: 'fit-content',
          width: 'fit-content',
        }}
      >
        <LazyLoadImage
          src={post.imageUrl}
          sx={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Tags */}
      <div
        sx={{
          display: 'flex',
          height: 'fit-content',
          width: '100%',
          marginTop: '1rem',
          padding: 0,
          '@media screen and (min-width: 750px)': {
            width: '60%',
            padding: '0 1rem',
            marginTop: 0,
          },
          flexDirection: 'column',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {post.message}
        </Typography.Title>
        <Divider style={{ margin: '0.5rem 0rem 0.9rem 0rem' }} />
        <div
          sx={{
            display: 'flex',
            height: 'fit-content',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          {post.tags.map((tag) => (
            <Tag
              color="#389e0d"
              key={tag.value}
              style={{
                width: 'fit-content',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              {tag.label}
            </Tag>
          ))}
        </div>
        <Divider style={{ margin: '0.4rem 0rem 0.5rem 0rem' }} />
        {/* <RowItem title="Author:" content={post.author.sub} /> */}
        <RowItem
          title="Created:"
          content={moment
            .unix(post.createdAt)
            .format('MMMM Do YYYY, h:mm:ss a')}
        />
        <RowItem
          title="Last Updated:"
          content={moment
            .unix(post.updatedAt)
            .format('MMMM Do YYYY, h:mm:ss a')}
        />
      </div>
    </div>
  );
}
