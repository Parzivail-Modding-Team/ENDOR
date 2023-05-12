import { Role } from '../utils';
import LocalResult from '../components/LocalResult';
import { useAuthContext } from '../contexts/AuthContext';
import { Skeleton } from 'antd';

export default function ProtectedRoute({ role, children }) {
  const { role: userRole } = useAuthContext();

  if (userRole < role) {
    return (
      <LocalResult
        title="Unauthorized"
        subtitle="Hey! You're not permitted in there, it's restricted!"
        status={403}
      />
    );
  }
  if (userRole >= role) {
    return children;
  }
}
