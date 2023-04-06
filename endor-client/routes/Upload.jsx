/** @jsxImportSource theme-ui */

import { useEffect, useState } from 'react';
import { Button, Empty, Form, Input, message, Select, Spin } from 'antd';
import { tagRender } from '../utils';
import { TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CreatePost, GetTags } from '../queries';
import axios from 'axios';

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
      const thing = { ...submission };
      thing.file = file;
      setSubmission(thing);
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
    console.log(submission.tags);
    if (!submission.tags || !submission.file) {
      return true;
    } else if (
      submission &&
      submission.tags &&
      submission.tags.length &&
      submission.tags.length > 0
    ) {
      return false;
    }
  };

  function onSubmit() {
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

    console.log(newSubmission);

    let formData = new FormData();
    formData.append('message', newSubmission.message);
    formData.append('createTags', JSON.stringify(newSubmission.createTags));
    formData.append('addTags', JSON.stringify(newSubmission.addTags));
    formData.append('file', newSubmission.file);

    axios
      .post('http://localhost:5173/createPost', formData, {
        headers: {
          'content-type': 'multipart/form-data',
          Accept: 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data && res.data._id) {
          navigate(`/${res.data._id}`);
          message.success('Post created successfully');
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  useEffect(() => {
    console.log(submission);
  }, [submission]);

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
      <Form onFinish={() => onSubmit()}>
        <Form.Item name="message">
          <Input
            placeholder="Ex. Here is a fun description about this image"
            onChange={(e) => {
              setSubmission({ ...submission, message: e.target.value });
            }}
            allowClear
          />
        </Form.Item>
        <Form.Item name="tags">
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
            options={tags || []}
            value={submission.tags}
            labelInValue
          />
        </Form.Item>
        <div
          sx={{
            width: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <label htmlFor="file" className="file-label">
            Upload File
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
        <button
          type="submit"
          style={{ alignSelf: 'flex-end', boxShadow: 'none' }}
        >
          Submit
        </button>
      </Form>
    </div>
  );
}
