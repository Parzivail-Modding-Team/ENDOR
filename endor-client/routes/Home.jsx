/** @jsxImportSource theme-ui */

import { Button, Select, Typography, Tag, Input } from 'antd';
import { useState } from 'react';
import { TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AnimatedText from '../components/AnimatedText';
import { options, tagRender } from '../utils';

export default function Home() {
  const [search, setSearch] = useState([]);
  const navigate = useNavigate();

  return (
    <div
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        sx={{
          height: 'fit-content',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <div
          sx={{
            height: 'fit-content',
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Typography.Title
            level={2}
            style={{ fontFamily: 'Gloock', margin: 0, marginRight: '0.4rem' }}
          >
            Search for
          </Typography.Title>
        </div>
        <AnimatedText />
      </div>
      <div
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Input.Group
          compact
          style={{
            width: '100%',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '45%' }}
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
              setSearch(e);
            }}
            options={options}
            value={search}
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
            disabled={!search || !search.length}
            onClick={() => {
              navigate({ pathname: '/browse', search: search.join('+') });
            }}
          >
            Search
          </Button>
        </Input.Group>
      </div>
    </div>
  );
}
