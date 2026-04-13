import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ServiceCenterRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Validating Access...</p></div>;

    // Allow both Admin and ServicePoint to access service center operations
    const isAuthorized = user && (user.role === 'ServicePoint' || user.role === 'Admin');

    return isAuthorized ? children : <Navigate to="/" />;
}
