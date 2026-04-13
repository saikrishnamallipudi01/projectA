import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-8 text-center text-sky3">Loading...</div>;

    return user?.role === 'Customer' ? children : <Navigate to="/" />;
}
