import { Tag, message } from 'antd';

export const Role = {
  Unauthorized: 0,
  ReadOnly: 1,
  ReadWrite: 2,
  Admin: 3,
};

export function capitalizeString(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function notifyGqlFetchError(graphQLErrors, target) {
  if (graphQLErrors) {
    message.error(
      'There was a problem fetching ' + target + ': ' + graphQLErrors[0].message
    );
  } else {
    message.error('There was a problem fetching ' + target);
  }
}

export function notifyGqlUpdateError(graphQLErrors, target) {
  if (graphQLErrors) {
    message.error(
      'There was a problem updating ' + target + ': ' + graphQLErrors[0].message
    );
  } else {
    message.error('There was a problem updating ' + target);
  }
}

export function notifyGqlDeleteError(graphQLErrors, target) {
  if (graphQLErrors) {
    message.error(
      'There was a problem deleting ' + target + ': ' + graphQLErrors[0].message
    );
  } else {
    message.error('There was a problem deleting ' + target);
  }
}

export const tagRender = (props, allowSparseTags) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      key={label}
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
