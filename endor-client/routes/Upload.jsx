/** @jsxImportSource theme-ui */

import { useState } from 'react';
import { Button, Empty, Form, Input, message, Select, Spin } from 'antd';
import { tagRender } from '../utils';
import { TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CreatePost, GetTags } from '../queries';

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.readAsDataURL(file);
  });

// TODO: input sanitization and pre-post validation
// TODO: file uploading
export function UploadRoute() {
  const [submission, setSubmission] = useState({});
  const [tags, setTags] = useState([]);

  const [dataUri, setDataUri] = useState();

  const localFileSaver = (file) => {
    if (!file) {
      setDataUri('');
      return;
    }

    fileToDataUri(file).then((dataUri) => {
      setDataUri(dataUri);
      setSubmission({ ...submission, file });
    });
  };

  const navigate = useNavigate();

  const { loading } = useQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  const [createPost] = useMutation(CreatePost, {
    onCompleted: (data) => {
      if (data && data.createPost) {
        navigate(`/${data.createPost}`);
        message.success('Post Created');
      }
    },
    onError: () => {
      message.error('There was a problem creating the post');
    },
  });

  const submissionChecker = () => {
    if (!submission.tags || !submission.file) {
      return true;
    } else if (
      submission &&
      submission.tags &&
      submission.tags.length &&
      submission.tags.length > 0 &&
      submission.file &&
      submission.file.name
    ) {
      return false;
    }
  };

  if (loading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  if (!tags) {
    message.warning('There was a problem fetching tags');
    return (
      <div>
        <Empty />
      </div>
    );
  }

  return (
    <div sx={{ height: '100%', width: '100%', padding: '1rem' }}>
      <Form
        layout="vertical"
        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Form.Item label="Description">
          <Input
            placeholder="Ex. Here is a fun description about this image"
            onChange={(e) => {
              setSubmission({ ...submission, message: e.target.value });
            }}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Tags" required>
          <Select
            mode="tags"
            allowClear
            style={{ width: '100%' }}
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
              setSubmission({ ...submission, tags: e });
            }}
            options={tags}
            value={submission.tags}
            labelInValue
          />
        </Form.Item>
        {/* TODO: move action to .env */}

        <Form.Item label="File To Upload" required>
          <div
            sx={{
              width: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <label for="file" class="file-label">
              Upload
              <input
                type="file"
                onChange={(e) => localFileSaver(e.target.files[0] || null)}
                sx={{ marginBottom: dataUri && '1rem' }}
                id="file"
                name="file"
              />
            </label>
            <img
              style={{
                maxWidth: '100%',
                borderRadius: '4px',
              }}
              src={dataUri}
            />
          </div>
        </Form.Item>
        <Form.Item style={{ alignSelf: 'flex-end' }}>
          <Button
            type="primary"
            style={{ alignSelf: 'flex-end', boxShadow: 'none' }}
            disabled={submissionChecker()}
            onClick={() => {
              const newSubmission = { ...submission };
              // Group together existing tags (i.e. tags that have a key)
              newSubmission.addTags = newSubmission.tags
                .filter((tag) => !!tag.key)
                .map((tag2) => {
                  return { _id: tag2.value };
                });
              // Group together new tags (i.e. tags that don't have a key)
              newSubmission.createTags = newSubmission.tags
                .filter((tag) => !tag.key)
                .map((tag2) => {
                  return { label: tag2.value };
                });
              delete newSubmission.tags;
              createPost({ variables: { input: newSubmission } });
            }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
