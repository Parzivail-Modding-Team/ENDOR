/** @jsxImportSource theme-ui */

import { Button, Select, Typography, Tag, Input } from 'antd';
import { useState } from 'react';
import { TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AnimatedText from '../components/AnimatedText';
import { options, tagRender } from '../utils';
import { useQuery } from '@apollo/client';
import { GetTags } from '../queries';
import TagSelect from '../components/TagSelect';

export default function Home() {
  const [search, setSearch] = useState([]);
  const [tags, setTags] = useState([]);

  const navigate = useNavigate();

  useQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: (error) => {
      message.error('There was a problem fetching tags');
    },
  });

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
        <div sx={{ width: '60%' }}>
          <TagSelect
            value={search}
            options={tags}
            onClick={() =>
              navigate({ pathname: '/browse', search: search.join('+') })
            }
            onChange={setSearch}
          />
        </div>
      </div>
    </div>
  );
}
