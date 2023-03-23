/** @jsxImportSource theme-ui */

import { Button, Select, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { tagRender } from '../utils';

export default function TagSelect({ options, value, onChange, onClick }) {
  return (
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
        options={options}
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
        disabled={!value || !value.length}
        onClick={() => {
          onClick();
        }}
      >
        Search
      </Button>
    </Input.Group>
  );
}
