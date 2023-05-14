/** @jsxImportSource theme-ui */
import { Select, Table, Typography, message } from 'antd';
import { useState } from 'react';
import { Role, notifyGqlFetchError, notifyGqlUpdateError } from '../utils';
import { keys, values } from 'lodash';
import { GetUsers, UpdateUser } from '../queries';
import { useMutation, useQuery } from '@apollo/client';
import { useAuthContext } from '../contexts/AuthContext';

const arrayKeys = keys(Role);
const arrayValue = values(Role);

const roles = arrayKeys.map((key, index) => {
  return { label: key, value: arrayValue[index] };
});

export default function Users() {
  const [users, setUsers] = useState();
  const [selectedUser, setSelectedUser] = useState('');

  const { id } = useAuthContext();

  const { loading } = useQuery(GetUsers, {
    onCompleted: (data) => {
      setUsers(data.getUsers);
    },
    onError: ({ graphQLErrors }) => {
      notifyGqlFetchError(graphQLErrors, 'users');
    },
  });

  const [updateUser, { loading: updateUserLoading }] = useMutation(UpdateUser, {
    onCompleted: (data) => {
      if (data.updateUser) {
        message.success('User Updated');
      }
    },
    onError: ({ graphQLErrors }) => {
      notifyGqlUpdateError(graphQLErrors, 'the user');
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
        {users && (
          <Table
            tableLayout="fixed"
            style={{ width: '100%' }}
            columns={[
              {
                title: 'User ID',
                dataIndex: 'id',
                defaultSortOrder: 'ascend',
              },
              {
                title: 'User',
                defaultSortOrder: 'ascend',
                render: (_, user) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      style={{
                        width: '19px',
                        height: '19px',
                        borderRadius: '50%',
                        marginRight: '0.5rem',
                      }}
                      src={user.avatarUrl}
                    />
                    <Typography.Text>{user.username}</Typography.Text>
                  </div>
                ),
              },
              {
                title: 'Actions',
                render: (_, user) => (
                  <Select
                    options={roles}
                    style={{ width: '150px' }}
                    defaultValue={user.role}
                    onSelect={(role) => {
                      setSelectedUser(user.id);
                      updateUser({
                        variables: { id: user.id, role },
                      });
                    }}
                    loading={user.id === selectedUser && updateUserLoading}
                    disabled={user.id === id}
                  />
                ),
              },
            ]}
            rowKey="id"
            dataSource={users}
            pagination={false}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
