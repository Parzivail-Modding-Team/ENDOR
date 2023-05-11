import { useQuery } from '@apollo/client';
import { createContext, useContext, useState } from 'react';
import { GetUser } from '../queries';
import { message } from 'antd';

const AuthContext = createContext({});

function AuthContextProvider({ children }) {
  const state = {};

  let setRole;
  let setAvatarUrl;

  [state.role, setRole] = useState();
  [state.avatarUrl, setAvatarUrl] = useState();

  useQuery(GetUser, {
    onCompleted: (data) => {
      setRole(data.getUser.role);
      setAvatarUrl(data.getUser.avatarUrl);
    },
    onError: ({ graphQLErrors }) => {
      if (graphQLErrors) {
        message.error(graphQLErrors[0].message);
      }
    },
  });

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthContextProvider };

export function useAuthContext() {
  return useContext(AuthContext);
}
