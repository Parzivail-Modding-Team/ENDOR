/** @jsxImportSource theme-ui */
import { useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Typography } from 'antd';
import { notifyGqlFetchError, tagRender } from '../utils';
import { PlusOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GetAllTagLabels } from '../queries';
import axios from 'axios';

const fileToDataUri = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.readAsDataURL(file);
  });

export default function UploadRoute() {
  const [submission, setSubmission] = useState({});
  const [tags, setTags] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [valid, setValid] = useState(false);

  const [dataUri, setDataUri] = useState();

  const localFileSaver = (file) => {
    if (!file) {
      setDataUri('');
      return;
    }

    fileToDataUri(file).then((dataUri) => {
      setDataUri(dataUri);
      setSubmission({ ...submission, file: file });
    });
  };

  const navigate = useNavigate();

  useQuery(GetAllTagLabels, {
    onCompleted: (data) => {
      setTags(data.getAllTagLabels);
    },
    onError: ({ graphQLErrors }) => {
      notifyGqlFetchError(graphQLErrors, 'tags');
    },
  });

  useEffect(() => {
    if (!submission.tags || submission.tags.length === 0 || !submission.file) {
      setValid(false);
    } else {
      setValid(true);
    }
  }, [submission.tags, submission.file]);

  function onSubmit() {
    setSubmitLoading(true);
    let formData = new FormData();
    formData.append('message', submission.message ? submission.message : '');
    formData.append(
      'tags',
      JSON.stringify(submission.tags.map((o) => o.value))
    );
    formData.append('file', submission.file);

    axios
      .post('/createPost', formData, {
        headers: {
          'content-type': 'multipart/form-data',
          Accept: 'multipart/form-data',
        },
      })
      .then((res) => {
        if (res.data && res.data._id) {
          setSubmitLoading(false);
          navigate(`/${res.data._id}`);
          message.success('Post created');
        }
      })
      .catch(() => {
        message.error('There was a problem creating the post');
      });
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
        <Form
          layout="vertical"
          style={{ paddingBottom: '1rem', width: '100%' }}
          title="Create Post"
        >
          <Form.Item
            name="message"
            label={
              <Typography.Title
                level={4}
                style={{
                  marginBottom: '0.25rem',
                }}
              >
                Message
              </Typography.Title>
            }
          >
            <Input
              placeholder="Ex. Here is a fun description about this image"
              onChange={(e) => {
                setSubmission({ ...submission, message: e.target.value });
              }}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="tags"
            label={
              <Typography.Title
                level={4}
                style={{
                  marginBottom: '0.25rem',
                  marginTop: 0,
                }}
              >
                Tags
              </Typography.Title>
            }
            required
          >
            <Select
              mode="tags"
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
              tagRender={(e) => tagRender(e, true)}
              onChange={(e) => {
                setSubmission({
                  ...submission,
                  tags: e,
                });
              }}
              optionFilterProp="label"
              fieldNames={{ value: 'label' }}
              labelInValue
              options={tags}
              value={submission.tags}
              notFoundContent={null}
            />
          </Form.Item>
          <Form.Item>
            <div
              sx={{
                display: 'flex',
                width: '100%',
                flexDirection: 'column',
                marginBottom: '0.5rem',
              }}
            >
              <label htmlFor="file" className="file-label">
                <PlusOutlined style={{ marginRight: '0.5rem' }} />
                Upload Image
                <input
                  type="file"
                  onChange={(e) => localFileSaver(e.target.files[0] || null)}
                  sx={{ marginBottom: dataUri && '1rem' }}
                  id="file"
                  name="file"
                  accept=".png,.jpg,.jpeg,.gif,.apng,.webp"
                />
              </label>
              <div
                sx={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  style={{
                    maxWidth: '100%',
                    borderRadius: '4px',
                  }}
                  src={dataUri}
                />
              </div>
            </div>
          </Form.Item>
          <div
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type="primary"
              style={{
                alignSelf: 'flex-end',
                boxShadow: 'none',
                width: 'fit-content',
              }}
              onClick={() => onSubmit()}
              loading={submitLoading}
              disabled={!valid}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
