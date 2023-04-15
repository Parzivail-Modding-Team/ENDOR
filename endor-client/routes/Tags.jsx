/** @jsxImportSource theme-ui */

import {
  Button,
  Divider,
  Input,
  Popconfirm,
  Skeleton,
  Statistic,
  Typography,
  message,
  Space,
} from 'antd';
import { GetTags } from '../queries';
import { DeleteOutlined, EditOutlined, TagOutlined } from '@ant-design/icons';
import LocalResult from '../components/LocalResult';
import { useColorMode } from 'theme-ui';
import { theme } from '../src/theme';

import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import _ from 'lodash';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [colorMode] = useColorMode();

  const [getTags, { loading }] = useLazyQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  useEffect(() => {
    if (search === '') {
      setTags([]);
    }
  }, [search]);

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
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'flex-end',
            }}
          >
            <div
              sx={{
                height: 'fit-content',
                width: '100%',
                display: 'flex',
              }}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  allowClear
                  className={
                    colorMode === 'light'
                      ? 'light-input-standard'
                      : 'dark-input-standard'
                  }
                  style={{
                    width: '100%',
                  }}
                  placeholder="Ex. landspeeder"
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
                <Button
                  type="primary"
                  onClick={() =>
                    getTags({
                      variables: { label: search },
                    })
                  }
                  style={{ boxShadow: 'none' }}
                >
                  Search
                </Button>
              </Space.Compact>
            </div>
            <Statistic
              title={
                <Typography.Text
                  style={{
                    color:
                      colorMode === 'light'
                        ? theme.colors.text
                        : theme.colors.modes.dark.text,
                  }}
                >
                  Results
                </Typography.Text>
              }
              value={tags.length}
              style={{
                marginLeft: '1rem',
                width: 'fit-content',
                color:
                  colorMode === 'light'
                    ? theme.colors.text
                    : theme.colors.modes.dark.text,
              }}
              valueStyle={{
                color:
                  colorMode === 'light'
                    ? theme.colors.text
                    : theme.colors.modes.dark.text,
              }}
            />
          </div>
          <Divider style={{ marginTop: '1rem', marginBottom: '1.5rem' }} />
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
              <Skeleton active />
            </div>
          )}
          {!loading && tags.length
            ? tags.map((tag) => (
                <div
                  sx={{
                    height: 'fit-content',
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                  key={tag._id}
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
              ))
            : null}
          {!loading && (!tags.length || tags.length === 0) ? (
            <LocalResult
              title="No Tags"
              subtitle="There were no tags with the specified label."
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
