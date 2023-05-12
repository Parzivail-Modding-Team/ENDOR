/** @jsxImportSource theme-ui */
import {
  Button,
  Divider,
  Image,
  Input,
  Popconfirm,
  Select,
  Tag,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { DeletePost, GetPostDetails, GetTags, UpdatePost } from '../queries';
import ImageSkeleton from '../components/ImageSkeleton';
import { theme } from '../theme';
import { useColorMode } from 'theme-ui';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Role, tagRender } from '../utils';
import { useAuthContext } from '../contexts/AuthContext';

function RowItem({ title, content }) {
  const [colorMode] = useColorMode();

  return (
    <div
      sx={{
        display: 'flex',
        width: '100%',
        height: 'fit-content',
        alignItems: 'center',
      }}
    >
      <Typography.Text
        style={{
          margin: 0,
          marginRight: '0.5rem',
          color:
            colorMode === 'light'
              ? theme.colors.text
              : theme.colors.modes.dark.text,
        }}
        strong
      >
        {title}
      </Typography.Text>
      <Typography.Text
        style={{
          margin: 0,
          color:
            colorMode === 'light'
              ? theme.colors.textAlt
              : theme.colors.modes.dark.textAlt,
        }}
        type="secondary"
        italic
      >
        {content}
      </Typography.Text>
    </div>
  );
}

export default function PostDetail() {
  const [post, setPost] = useState({});
  const [tags, setTags] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editedPost, setEditedPost] = useState();

  const [colorMode] = useColorMode();

  const location = useLocation();
  const navigate = useNavigate();

  const { loading: getPostDetailsLoading } = useQuery(GetPostDetails, {
    variables: { _id: location.pathname.substring(1) },
    onCompleted: (data) => {
      setPost(data.getPostDetails[0]);
    },
    onError: () => {
      message.error('There was a problem fetching the post');
    },
  });

  const [getTags] = useLazyQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  const [updatePost, { loading: updatePostLoading }] = useMutation(UpdatePost, {
    onCompleted: () => {
      window.location.reload();
    },
    onError: () => {
      message.error('There was a problem updating the post');
    },
  });

  const [deletePost] = useMutation(DeletePost, {
    onCompleted: (data) => {
      if (data && data.deletePost) {
        navigate('/');
        message.success('Post deleted');
      } else {
        message.error('There was a problem deleting the post');
      }
    },
    onError: () => {
      message.error('There was a problem deleting the post');
    },
  });

  const { role } = useAuthContext();

  if (getPostDetailsLoading) {
    return <ImageSkeleton />;
  }

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
        <Image
          src={post.imageUrl}
          sx={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '4px',
          }}
        />
      </div>
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
        {editing ? (
          <Input
            placeholder="Ex. Here is a fun description about this image"
            onChange={(e) => {
              setEditedPost({ ...editedPost, message: e.target.value });
            }}
            allowClear
            className={
              colorMode === 'light'
                ? 'light-input-standard'
                : 'dark-input-standard'
            }
            style={{ marginBottom: '0.75rem' }}
            value={editedPost.message}
          />
        ) : (
          <div>
            {post.message ? (
              <Typography.Title
                level={4}
                style={{
                  margin: 0,
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
              >
                {post.message}
              </Typography.Title>
            ) : null}
          </div>
        )}
        <Divider
          style={{
            margin: !post.message ? '0 0 0.9rem 0' : '0.5rem 0rem 0.9rem 0rem',
            backgroundColor:
              colorMode === 'light'
                ? theme.colors.divider
                : theme.colors.modes.dark.divider,
          }}
        />
        {editing ? (
          <Select
            mode="tags"
            allowClear
            className={colorMode === 'light' ? 'light-input' : 'dark-input'}
            style={{
              width: '100%',
              marginBottom: '0.5rem',
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
            tagRender={(e) => tagRender(e, true)}
            onChange={(e) => {
              setEditedPost({ ...editedPost, tags: e });
            }}
            fieldNames={{ value: '_id' }}
            options={tags}
            value={editedPost.tags}
            optionFilterProp="label"
            labelInValue
            notFoundContent={null}
          />
        ) : (
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
                color={theme.colors.primary}
                key={tag._id}
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
        )}

        <Divider
          style={{
            margin: '0.4rem 0rem 0.5rem 0rem',
            backgroundColor:
              colorMode === 'light'
                ? theme.colors.divider
                : theme.colors.modes.dark.divider,
          }}
        />
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
        <Divider
          style={{
            margin: '0.4rem 0rem 1rem 0rem',
            backgroundColor:
              colorMode === 'light'
                ? theme.colors.divider
                : theme.colors.modes.dark.divider,
          }}
        />
        {role < Role.ReadWrite ? null : (
          <div
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Popconfirm
              title="Delete post"
              description="Are you sure you want to delete this post?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => deletePost({ variables: { _id: post._id } })}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                style={{ marginRight: '1rem' }}
              />
            </Popconfirm>

            <div
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {editing && (
                <Button
                  type="default"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setEditing(false);
                    setEditedPost(post);
                  }}
                  style={{ marginRight: '1rem' }}
                />
              )}

              {editing ? (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    updatePost({
                      variables: {
                        _id: post._id,
                        input: {
                          message: editedPost.message,
                          addTags: editedPost.tags
                            .filter((tag) => !!tag.key)
                            .map((tag2) => {
                              return { label: tag2.label, value: tag2.value };
                            }),
                          createTags: editedPost.tags
                            .filter((tag) => !tag.key)
                            .map((tag2) => {
                              return { label: tag2.value };
                            }),
                        },
                      },
                    });
                  }}
                  loading={updatePostLoading}
                />
              ) : (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditedPost({
                      ...post,
                      tags: post.tags.map((tag) => {
                        return {
                          key: tag._id,
                          label: tag.label,
                          value: tag._id,
                        };
                      }),
                    });
                    setEditing(true);
                    getTags();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
