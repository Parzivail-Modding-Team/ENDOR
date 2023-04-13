/** @jsxImportSource theme-ui */

import { useState } from 'react';
import { Button, Select, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { tagRender } from '../utils';
import { useQuery } from '@apollo/client';
import { GetTags } from '../queries';

export default function TagSelect({ value, onChange, onClick, style }) {
  const [tags, setTags] = useState([]);

  useQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  return (
    <Input.Group
      compact
      style={{
        width: '100%',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Select
        mode="multiple"
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
          onChange(e);
        }}
        options={tags}
        value={value}
        maxTagCount="responsive"
      />
      <Button
        type="primary"
        style={{
          width: 'fit-content',
          height: 'auto',
          margin: 0,
          boxShadow: 'none',
        }}
        onClick={() => {
          onClick();
        }}
      >
        Search
      </Button>
    </Input.Group>
  );
}
