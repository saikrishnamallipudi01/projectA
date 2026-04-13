import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../modals/AuthModal';
import TokenFlowModal from '../modals/TokenFlowModal';
import api from '../../api/axiosInstance';
import './Navbar.css';

const TYPE_ICON = {
    new_booking:      '🆕',
    booking_accepted: '✅',
    booking_rejected: '❌',
    job_completed:    '🎉',
    general:          '🔔',
};

const TYPE_BG_UNREAD = {
    new_booking:      'rgba(234,179,8,.10)',
    booking_accepted: 'rgba(34,197,94,.07)',
    booking_rejected: 'rgba(239,68,68,.07)',
    job_completed:    'rgba(244,63,94,.06)',
    general:          'var(--bg-subtle)',
};

const roleHome = (role) => {
    if (role === 'Admin') return '/admin/bookings';
    if (role === 'ServicePoint') return '/service-center/bookings';
    if (role === 'Technician') return '/technician/bookings';
    return '/bookings';
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [authOpen, setAuthOpen] = useState(false);
    const [tokenOpen, setTokenOpen] = useState(false);
    const [tokenMode, setTokenMode] = useState('get');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const notifRef = useRef(null);

    // ── fetch full notification list (every 8s) ──
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (e) {}
    };

    // ── fast count poll (every 5s) used only when dropdown is closed ──
    const fetchCount = async () => {
        if (!user || showNotif) return;
        try {
            const { data } = await api.get('/notifications/count');
            setUnreadCount(data.count);
        } catch {}
    };

    useEffect(() => {
        fetchNotifications();
        const fullInterval = setInterval(fetchNotifications, 8000);
        const countInterval = setInterval(fetchCount, 5000);
        return () => { clearInterval(fullInterval); clearInterval(countInterval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // close dropdown on outside click (works on Android too)
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, []);

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch {}
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {}
    };

    const deleteNotif = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            const updated = notifications.filter(n => n._id !== id);
            setNotifications(updated);
            setUnreadCount(updated.filter(n => !n.isRead).length);
        } catch {}
    };

    const handleNotifClick = (n) => {
        if (!n.isRead) markRead(n._id);
        setShowNotif(false);
        navigate(roleHome(user.role));
    };

    const openToken = (mode) => { setTokenMode(mode); setTokenOpen(true); };

    const newBookingCount = notifications.filter(n => !n.isRead && n.type === 'new_booking').length;

    return (
        <>
            <nav className="no-print">
                <Link to="/" className="logo" aria-label="ATNIS home">AT<span>NIS</span></Link>

                {/* ── Desktop nav links ── */}
                <div className="nav-center-links">
                    <Link to="/services" className="nav-link">Services</Link>
                    {user && <Link to="/technicians" className="nav-link">Our Experts</Link>}
                    {user && user.role === 'Customer' && <Link to="/bookings" className="nav-link">My Bookings</Link>}
                    {(user?.role === 'Admin' || user?.role === 'ServicePoint') && (
                        <Link to="/service-center/bookings" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 700 }}>Bookings Hub</Link>
                    )}
                    {user?.role === 'Admin' && (
                        <>
                            <Link to="/admin/bookings" className="nav-link" style={{ color: 'var(--danger)', fontWeight: 700 }}>Admin</Link>
                            <Link to="/admin/sectors" className="nav-link">Sectors CMS</Link>
                            <Link to="/admin/services" className="nav-link">Services CMS</Link>
                        </>
                    )}
                    {user?.role === 'Technician' && (
                        <Link to="/technician/bookings" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 700 }}>My Tasks</Link>
                    )}
                </div>

                <div className="nav-actions">
                    {/* Track Token button */}
                    <button
                        className="nav-track-btn"
                        onClick={() => openToken('check')}
                        aria-label="Track token"
                    >
                        🔍 <span className="nav-btn-label">Track Token</span>
                    </button>

                    {user ? (
                        <>
                            {/* ── Notification Bell ── */}
                            <div style={{ position: 'relative' }} ref={notifRef}>
                                <button
                                    className={`notif-bell-btn ${newBookingCount > 0 ? 'has-new' : ''}`}
                                    onClick={() => { setShowNotif(v => !v); if (!showNotif) fetchNotifications(); }}
                                    aria-label={`${unreadCount} notifications`}
                                    aria-expanded={showNotif}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                                    )}
                                </button>

                                {showNotif && (
                                    <div className="notif-dropdown">
                                        {/* Header */}
                                        <div className="notif-header">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                <span style={{ fontSize: '.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>🔔 Notifications</span>
                                                {unreadCount > 0 && (
                                                    <span style={{ background: 'var(--danger)', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: '.65rem', fontWeight: 700 }}>
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                                                {notifications.length > 0 && (
                                                    <button onClick={markAllRead} className="notif-action-btn">✓ All</button>
                                                )}
                                                <button onClick={() => setShowNotif(false)} className="notif-close-btn" aria-label="Close">✕</button>
                                            </div>
                                        </div>

                                        {/* Admin / ServicePoint: show new booking alerts at top */}
                                        {(user.role === 'Admin' || user.role === 'ServicePoint') && newBookingCount > 0 && (
                                            <div style={{ padding: '.6rem 1rem', background: 'rgba(234,179,8,.12)', borderBottom: '1px solid rgba(234,179,8,.2)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#b45309' }}>
                                                    🆕 {newBookingCount} new customer {newBookingCount === 1 ? 'request' : 'requests'} awaiting review
                                                </span>
                                                <button
                                                    onClick={() => { markAllRead(); setShowNotif(false); navigate(roleHome(user.role)); }}
                                                    style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                                                >
                                                    View →
                                                </button>
                                            </div>
                                        )}

                                        {/* Notification list */}
                                        <div className="notif-list">
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '.84rem', color: 'var(--text-muted)' }}>
                                                    <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✨</div>
                                                    You're all caught up!
                                                </div>
                                            ) : notifications.map(n => {
                                                const icon = TYPE_ICON[n.type] || '🔔';
                                                const bg = !n.isRead ? (TYPE_BG_UNREAD[n.type] || 'var(--bg-subtle)') : '#ffffff';
                                                return (
                                                    <div
                                                        key={n._id}
                                                        className="notif-item"
                                                        style={{ background: bg }}
                                                        onClick={() => handleNotifClick(n)}
                                                    >
                                                        <div style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>{icon}</div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{
                                                                fontSize: '.79rem',
                                                                color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                                fontWeight: n.isRead ? 400 : 700,
                                                                lineHeight: 1.4,
                                                                wordBreak: 'break-word'
                                                            }}>
                                                                {n.message}
                                                            </div>
                                                            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginTop: 3 }}>
                                                                {new Date(n.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                                                            {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                                                            <button
                                                                onClick={e => deleteNotif(e, n._id)}
                                                                title="Dismiss"
                                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', fontSize: '.7rem', lineHeight: 1, borderRadius: 4 }}
                                                            >✕</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Avatar */}
                            <div
                                className="uav"
                                title={user.name}
                                style={user.role === 'Admin' ? { background: 'var(--danger)', cursor: 'pointer' } : { cursor: 'pointer' }}
                                onClick={() => navigate(roleHome(user.role))}
                            >
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <button className="bg" onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <button className="bp" style={{ width: 'auto', padding: '.46rem 1.1rem', fontSize: '.82rem', marginTop: 0 }} onClick={() => setAuthOpen(true)}>
                            Login / Register
                        </button>
                    )}
                </div>
            </nav>

            {/* ── User bar (below nav) ── */}
            {user && (
                <div className="ubar no-print">
                    <div className="uav" style={{ width: 34, height: 34, fontSize: '.88rem', flexShrink: 0, ...(user.role === 'Admin' ? { background: 'var(--danger)' } : {}) }}>
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.role} · {user.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        {(user.role === 'Admin' || user.role === 'ServicePoint') && (
                            <button className="bg" style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)', fontSize: '.76rem' }} onClick={() => navigate('/service-center/bookings')}>🛠 Bookings Hub</button>
                        )}
                        {user.role === 'Admin' && (
                            <>
                                <button className="bg" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', fontSize: '.76rem' }} onClick={() => navigate('/admin/bookings')}>🔑 Admin</button>
                                <button className="bg" style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)', fontSize: '.76rem' }} onClick={() => navigate('/admin/sectors')}>📁 Sectors</button>
                                <button className="bg" style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)', fontSize: '.76rem' }} onClick={() => navigate('/admin/services')}>🛠 Services</button>
                            </>
                        )}
                        {user.role === 'Technician' && (
                            <button className="bg" style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)', fontSize: '.76rem' }} onClick={() => navigate('/technician/bookings')}>📋 My Tasks</button>
                        )}
                        {user.role === 'Customer' && (
                            <button className="bg" style={{ fontSize: '.76rem' }} onClick={() => navigate('/bookings')}>📋 Bookings</button>
                        )}
                        <button className="bg" style={{ fontSize: '.76rem' }} onClick={() => navigate('/invoice')}>🧾 Invoice</button>
                        {user.role !== 'Customer' && user.role !== 'Technician' && (
                            <button className="bg" style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)', fontSize: '.76rem' }} onClick={() => openToken('get')}>🎫 Get Token</button>
                        )}
                    </div>
                </div>
            )}

            <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
            <TokenFlowModal isOpen={tokenOpen} mode={tokenMode} onClose={() => setTokenOpen(false)} />
        </>
    );
};

export default Navbar;
