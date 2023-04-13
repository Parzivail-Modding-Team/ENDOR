/** @jsxImportSource theme-ui */

import { Button, Input, Popconfirm, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GetTags } from '../queries';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import LocalResult from '../components/LocalResult';

export default function Tags() {
  const [tags, setTags] = useState([]);

  const { loading, error } = useQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  const navigate = useNavigate();

  if (loading && !tags.length) {
    return (
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
        <Skeleton active />
      </div>
    );
  }

  if (!loading && (!tags.length || error)) {
    return (
      <LocalResult
        title="No Tags"
        subTitle="We could not find any tags, please try again or create a new tag."
      />
    );
  }

  return (
    <div
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography.Title level={2}>{tags.length} Tags</Typography.Title>
      {!loading &&
        tags.length &&
        tags.map((tag) => (
          <div
            sx={{
              height: 'fit-content',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <Input defaultValue={tag.label} />
            <div
              sx={{
                height: 'fit-content',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Popconfirm
                title="Delete tag"
                description="Are you sure you want to delete this tag?"
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ marginRight: '1rem' }}
                />
              </Popconfirm>
              <Popconfirm
                title="Edit tag"
                description="Are you sure you want to edit this tag?"
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" icon={<EditOutlined />} />
              </Popconfirm>
            </div>
          </div>
        ))}
    </div>
  );
}
