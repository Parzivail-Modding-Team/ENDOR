/** @jsxImportSource theme-ui */

import { Button, Divider, Input, Popconfirm, Skeleton, Statistic } from 'antd';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GetTags } from '../queries';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import LocalResult from '../components/LocalResult';
import TagSelect from '../components/TagSelect';

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
        alignItems: 'center',
      }}
    >
      <div
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
              height: 'fit-content',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <div
              sx={{
                height: 'fit-content',
                width: '100%',
                display: 'flex',
              }}
            >
              <TagSelect style={{ marginBottom: '7px' }} />
            </div>
            <Statistic
              title="Results"
              value={tags.length}
              style={{ marginLeft: '1rem', width: 'fit-content' }}
            />
          </div>
          <Divider style={{ marginTop: '1rem', marginBottom: '1.5rem' }} />
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
      </div>
    </div>
  );
}
