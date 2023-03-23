/** @jsxImportSource theme-ui */

import { useEffect, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  message,
  Select,
  Spin,
  Upload,
} from 'antd';
import { tagRender } from '../utils';
import { TagOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CreatePost, GetTags } from '../queries';

function renderChecker() {
  if (
    localFileList &&
    localFileList[0] &&
    localFileList[0].status &&
    localFileList[0].status === 'uploading'
  ) {
    return <Spin />;
  } else if (
    localFileList &&
    localFileList[0] &&
    localFileList[0].response &&
    localFileList[0].response === 'Uploaded'
  ) {
    return <Empty />;
  }
}

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
  const [localFileList, setLocalFileList] = useState([]);

  const [dataUri, setDataUri] = useState();

  const localFileSaver = (file) => {
    if (!file) {
      setDataUri('');
      return;
    }

    fileToDataUri(file).then((dataUri) => {
      setDataUri(dataUri);
    });
  };

  const navigate = useNavigate();

  useQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: (error) => {
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
    onError: (error) => {
      console.log(error);
    },
  });

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
              console.log(e);
              setSubmission({ ...submission, tags: e });
            }}
            options={tags}
            value={submission.tags}
            labelInValue
          />
        </Form.Item>
        {/* TODO: move action to .env */}

        <Form.Item label="File To Upload" required>
          {/* <Upload.Dragger
            listType="picture"
            multiple={false}
            maxCount={1}
            action="http://localhost:4000/upload"
            name="upload"
            fileList={localFileList}
            onChange={({ fileList }) => {
              localFileSaver(fileList[0]);
              setLocalFileList(fileList);
            }}
          >
            {localFileList &&
              localFileList.length &&
              localFileList.length === 1 &&
              localFileList.map((file) => {
                return (
                  <img
                    style={{
                      maxWidth: 'calc(100% - 2rem)',
                      borderRadius: '4px',
                    }}
                    src={dataUri}
                  />
                );
              })}
          </Upload.Dragger> */}
          <div>
            <input
              type="file"
              onChange={(e) => localFileSaver(e.target.files[0] || null)}
              sx={{ marginBottom: dataUri && '1rem' }}
            ></input>
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
            disabled={!submission.tags || !submission.message}
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
