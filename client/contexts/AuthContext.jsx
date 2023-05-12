import { useQuery } from '@apollo/client';
import { createContext, useContext, useEffect, useState } from 'react';
import { GetUser } from '../queries';
import { message } from 'antd';

const AuthContext = createContext({});

function AuthContextProvider({ children }) {
  const state = {};

  let setId;
  let setRole;
  let setAvatarUrl;

  [state.id, setId] = useState();
  [state.role, setRole] = useState();
  [state.avatarUrl, setAvatarUrl] = useState();

  useQuery(GetUser, {
    onCompleted: (data) => {
      setId(data.getUser.id);
      setRole(data.getUser.role);
      setAvatarUrl(data.getUser.avatarUrl);
      localStorage.setItem('userRole', data.getUser.role);
    },
    onError: ({ graphQLErrors }) => {
      if (graphQLErrors) {
        message.error(graphQLErrors[0].message);
      }
    },
  });

  useEffect(() => {
    const fetchedRole = localStorage.getItem('userRole');
    if (typeof fetchedRole === 'undefined' || fetchedRole === null) {
      return;
    } else {
      setRole(fetchedRole);
    }
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthContextProvider };

export function useAuthContext() {
  return useContext(AuthContext);
}
