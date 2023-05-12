import { Tag } from 'antd';

export const Role = {
  Unauthorized: 0,
  ReadOnly: 1,
  ReadWrite: 2,
  Admin: 3,
};

export function capitalizeString(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const tagRender = (props, allowSparseTags) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (!allowSparseTags && label === value) {
    return;
  }

  return (
    <Tag
      key={value}
      color="#389e0d"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{
        marginRight: 3,
      }}
    >
      {label}
    </Tag>
  );
};
