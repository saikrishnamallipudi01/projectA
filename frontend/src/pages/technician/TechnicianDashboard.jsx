import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [takenJobIds, setTakenJobIds] = useState(new Set()); // jobs taken by others
    const [loading, setLoading] = useState(true);
    const [progressInput, setProgressInput] = useState({});
    const [acceptingId, setAcceptingId] = useState(null);
    const [techNotifications, setTechNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await api.get('/bookings/my');
            setBookings(res.data);
        } catch {
            // silent — don't spam toast on every poll
        }
    }, []);

    const fetchAvailableJobs = useCallback(async () => {
        try {
            const res = await api.get('/bookings/available');
            setAvailableJobs(res.data);
        } catch {
            // silent
        }
    }, []);

    const fetchTechNotifications = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications');
            setTechNotifications(data);
        } catch {}
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all([fetchBookings(), fetchAvailableJobs(), fetchTechNotifications()]);
        } finally {
            setLoading(false);
        }
    }, [fetchBookings, fetchAvailableJobs, fetchTechNotifications]);

    useEffect(() => {
        fetchAll();
        // Auto-refresh every 8 seconds for near-real-time updates
        const interval = setInterval(() => {
            fetchBookings();
            fetchAvailableJobs();
            fetchTechNotifications();
        }, 8000);
        return () => clearInterval(interval);
    }, [fetchAll, fetchBookings, fetchAvailableJobs, fetchTechNotifications]);

    const acceptJob = async (id) => {
        setAcceptingId(id);
        try {
            await api.put(`/bookings/${id}/accept`);
            toast.success('🎉 Job accepted! It has been assigned to you.');
            // Remove from taken set if it was there
            setTakenJobIds(prev => { const s = new Set(prev); s.delete(id); return s; });
            fetchBookings();
            fetchAvailableJobs();
            fetchTechNotifications();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to accept job';
            if (err.response?.status === 409) {
                toast.error('⚠️ This job was already accepted by another technician');
                // Mark as taken and remove from available list
                setTakenJobIds(prev => new Set([...prev, id]));
                fetchAvailableJobs(); // Refresh to remove it from server
            } else {
                toast.error(msg);
            }
        } finally {
            setAcceptingId(null);
        }
    };

    const advanceBooking = async (id) => {
        try {
            await api.put(`/bookings/${id}/advance`);
            toast.success('Step advanced');
            fetchBookings();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to advance'); }
    };

    const rejectBooking = async (id) => {
        if(!window.confirm('Are you sure you want to reject this assigned job?')) return;
        try {
            await api.put(`/bookings/${id}/reject`);
            toast.success('Job rejected & unassigned');
            fetchBookings();
            fetchAvailableJobs();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject job'); }
    };

    const informArriving = async (id) => {
        if(!window.confirm('Send arriving notification to customer?')) return;
        try {
            await api.put(`/bookings/${id}/arriving`);
            toast.success('Customer notified of arriving status');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to notify arriving'); }
    };

    const addProgress = async (id) => {
        if (!progressInput[id]) return;
        try {
            await api.put(`/bookings/${id}/progress`, { note: progressInput[id] });
            toast.success('Progress updated');
            setProgressInput(p => ({ ...p, [id]: '' }));
            fetchBookings();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update progress'); }
    };

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Loading Dashboard...</p></div>;

    const unreadTechNotifs = techNotifications.filter(n => !n.isRead).length;
    const acceptedNotifs = techNotifications.filter(n => n.type === 'booking_accepted' && !n.isRead);

    const markTechNotifRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setTechNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch {}
    };

    const markAllTechNotifsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setTechNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {}
    };

    return (
        <div className="main fu">
            <div className="sec-tag">Technician Portal</div>
            <h2 className="sec-title">My Dashboard</h2>
            <p className="sec-sub">Accept new jobs, manage active tasks, and provide progress updates.</p>

            {/* ── LIVE NOTIFICATION STRIP ── */}
            {unreadTechNotifs > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(244,63,94,.07), rgba(234,179,8,.06))',
                    border: '1.5px solid var(--primary-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '.7rem 1.1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.75rem',
                    flexWrap: 'wrap',
                    animation: 'fadeUp .3s ease'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>🔔</span>
                    <div style={{ flex: 1, fontSize: '.82rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        You have {unreadTechNotifs} unread notification{unreadTechNotifs > 1 ? 's' : ''}
                        {acceptedNotifs.length > 0 && (
                            <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '.4rem' }}>
                                — including job acceptance updates
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
                        <button
                            onClick={() => setShowNotifPanel(v => !v)}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 7, padding: '.35rem .9rem', fontSize: '.73rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                            {showNotifPanel ? 'Hide' : 'View All'}
                        </button>
                        <button
                            onClick={markAllTechNotifsRead}
                            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 7, padding: '.35rem .8rem', fontSize: '.73rem', cursor: 'pointer' }}
                        >
                            ✓ All
                        </button>
                    </div>
                </div>
            )}

            {/* ── NOTIFICATIONS PANEL (collapsible) ── */}
            {showNotifPanel && (
                <div style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    animation: 'fadeUp .25s ease',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ padding: '.75rem 1.1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: 800, fontSize: '.85rem', color: 'var(--text-primary)' }}>
                        🔔 Recent Notifications
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {techNotifications.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.82rem' }}>No notifications yet</div>
                        ) : techNotifications.slice(0, 20).map(n => {
                            const icons = { new_booking: '🆕', booking_accepted: '✅', booking_rejected: '❌', job_completed: '🎉', general: '🔔' };
                            const bgs = { new_booking: 'rgba(234,179,8,.07)', booking_accepted: 'rgba(34,197,94,.07)', booking_rejected: 'rgba(239,68,68,.07)' };
                            return (
                                <div
                                    key={n._id}
                                    onClick={() => { if (!n.isRead) markTechNotifRead(n._id); }}
                                    style={{
                                        padding: '.7rem 1.1rem',
                                        borderBottom: '1px solid var(--border)',
                                        background: n.isRead ? '#fff' : (bgs[n.type] || 'var(--bg-subtle)'),
                                        display: 'flex', gap: '.75rem', alignItems: 'flex-start',
                                        cursor: n.isRead ? 'default' : 'pointer',
                                        transition: 'background .15s'
                                    }}
                                >
                                    <span style={{ fontSize: '.95rem', flexShrink: 0 }}>{icons[n.type] || '🔔'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '.79rem', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.isRead ? 400 : 700, lineHeight: 1.4, wordBreak: 'break-word' }}>
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize: '.64rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {new Date(n.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── AVAILABLE JOBS SECTION ── */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem',
                    padding: '.75rem 1.2rem', background: 'linear-gradient(135deg, rgba(234,179,8,.08), rgba(244,63,94,.06))',
                    border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-md)'
                }}>
                    <span style={{ fontSize: '1.3rem' }}>📢</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                            Available Jobs
                            {availableJobs.length > 0 && (
                                <span style={{
                                    background: 'var(--danger)', color: 'white', borderRadius: 999,
                                    padding: '2px 8px', fontSize: '.7rem', fontWeight: 700
                                }}>{availableJobs.length}</span>
                            )}
                        </div>
                        <div style={{ fontSize: '.76rem', color: 'var(--text-muted)' }}>
                            New customer requests · First to accept claims the job · Auto-refreshes every 8s
                        </div>
                    </div>
                    <button
                        onClick={() => { fetchBookings(); fetchAvailableJobs(); fetchTechNotifications(); }}
                        style={{ background: 'transparent', border: '1px solid var(--accent-border)', color: 'var(--accent)', borderRadius: 7, padding: '.3rem .7rem', fontSize: '.7rem', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
                    >🔄</button>
                </div>

                {availableJobs.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-white)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)', fontSize: '.85rem'
                    }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '.5rem' }}>✨</span>
                        No available jobs right now. New requests will appear here automatically.
                    </div>
                ) : (
                    <div className="available-jobs-grid">
                        {availableJobs.map(job => {
                            const isTaken = takenJobIds.has(job._id);
                            return (
                                <div key={job._id} className="available-job-card" style={isTaken ? { opacity: .55, pointerEvents: 'none' } : {}}>
                                    {isTaken && (
                                        <div style={{
                                            position: 'absolute', inset: 0, background: 'rgba(239,68,68,.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: 'inherit', zIndex: 2
                                        }}>
                                            <span style={{ background: 'var(--danger)', color: 'white', borderRadius: 999, padding: '.3rem .9rem', fontSize: '.75rem', fontWeight: 800 }}>
                                                ⛔ Taken by another technician
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.4rem' }}>
                                                <span style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--primary)' }}>{job.serviceName}</span>
                                                <span className="chip" style={{ fontSize: '.62rem' }}>{job.categoryIcon} {job.categoryName}</span>
                                                <span style={{
                                                    fontSize: '.65rem', fontWeight: 700, padding: '.18rem .55rem',
                                                    borderRadius: 999, background: 'var(--accent-light)',
                                                    color: '#b45309', border: '1px solid var(--accent-border)'
                                                }}>🆕 NEW</span>
                                            </div>
                                            <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                                <div>👤 <strong style={{ color: 'var(--text-primary)' }}>{job.customerName}</strong> · 📞 {job.customerPhone}</div>
                                                {job.address && <div>📍 {job.address}</div>}
                                                {job.slot && <div>⏰ Slot: <strong>{job.slot}</strong></div>}
                                                {job.workDescription && (
                                                    <div style={{
                                                        background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
                                                        padding: '.35rem .55rem', borderRadius: 8, margin: '.3rem 0',
                                                        color: 'var(--accent)', fontSize: '.75rem'
                                                    }}><strong>Work:</strong> {job.workDescription}</div>
                                                )}
                                                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                                                    📅 {new Date(job.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {' · '}💰 ₹{job.price?.toLocaleString('en-IN') || '—'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'flex-end' }}>
                                            <button
                                                className="bp"
                                                disabled={acceptingId === job._id || isTaken}
                                                onClick={() => acceptJob(job._id)}
                                                style={{
                                                    width: 'auto', marginTop: 0, padding: '.55rem 1.3rem',
                                                    fontSize: '.82rem', fontWeight: 800,
                                                    background: isTaken ? '#e5e7eb' : (acceptingId === job._id ? 'var(--text-muted)' : 'var(--primary)'),
                                                    color: isTaken ? 'var(--text-muted)' : 'white',
                                                    borderRadius: 'var(--radius-md)',
                                                    minWidth: '130px',
                                                    boxShadow: isTaken ? 'none' : '0 4px 12px rgba(244,63,94,.25)',
                                                    transition: 'all .2s'
                                                }}
                                            >
                                                {isTaken ? '⛔ Taken' : (acceptingId === job._id ? '⏳ Accepting...' : '✅ Accept Job')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── MY ASSIGNED WORK ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem',
                padding: '.65rem 1.2rem', background: 'var(--primary-light)',
                border: '1.5px solid var(--primary-border)', borderRadius: 'var(--radius-md)'
            }}>
                <span style={{ fontSize: '1.1rem' }}>📋</span>
                <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--primary)' }}>
                    My Assigned Work ({bookings.length})
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="empty"><span className="ei">📋</span><p>No active assignments yet. Accept a job above to get started!</p></div>
            ) : (
                bookings.map(bk => (
                    <div key={bk._id} className="token-queue-card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                                    <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--primary)' }}>{bk.serviceName}</span>
                                    <span className="chip" style={{ fontSize: '.65rem' }}>{bk.categoryName}</span>
                                    <span className={`status-pill ${bk.step === 5 ? 's-done' : 's-inprogress'}`}>
                                        {bk.step === 5 ? '✅ Completed' : `⏳ Step ${bk.step}/5`}
                                    </span>
                                </div>
                                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                                    <div>👤 <strong style={{ color: 'var(--text-primary)' }}>{bk.customerName}</strong> · 📞 {bk.customerPhone} {bk.slot && <span className="chip" style={{ fontSize: '.6rem' }}>⏰ {bk.slot}</span>}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                        📍 Address: {bk.address || bk.riseLocation || 'N/A'}
                                    </div>
                                    {bk.workDescription && <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)', padding: '.4rem .6rem', borderRadius: 8, margin: '.4rem 0', color: 'var(--accent)', fontSize: '.78rem' }}><strong>Work Purpose:</strong> {bk.workDescription}</div>}
                                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>📅 Assigned on {new Date(bk.bookingDate).toLocaleDateString('en-IN')}</div>

                                    {bk.progressNotes?.length > 0 && (
                                        <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                            <div style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '.3rem' }}>Work Progress Updates</div>
                                            {bk.progressNotes.map((pn, i) => (
                                                <div key={i} style={{ fontSize: '.72rem', color: 'var(--text-secondary)', marginBottom: '.2rem' }}>
                                                    • {pn.note} <span style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>({new Date(pn.timestamp).toLocaleTimeString()})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                {bk.step < 5 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                className="fi"
                                                placeholder="Update work progress..."
                                                value={progressInput[bk._id] || ''}
                                                onChange={e => setProgressInput(p => ({ ...p, [bk._id]: e.target.value }))}
                                                style={{ width: '220px', fontSize: '.75rem', padding: '0.4rem 0.6rem' }}
                                            />
                                            <button onClick={() => addProgress(bk._id)} style={{ position: 'absolute', right: '5px', top: '5px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '.7rem' }}>➕ Update</button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {bk.step < 4 && <button className="bp" style={{ width: 'auto', padding: '.4rem 1rem', fontSize: '.75rem', marginTop: 0, background: 'var(--bg-white)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }} onClick={() => rejectBooking(bk._id)}>✖ Reject</button>}
                                            <button className="bp" style={{ width: 'auto', padding: '.4rem 1rem', fontSize: '.75rem', marginTop: 0, background: 'var(--bg-subtle)', color: 'var(--primary)', border: '1px solid var(--border)' }} onClick={() => informArriving(bk._id)}>🚀 Inform Arriving</button>
                                            <button className="bp" style={{ width: 'auto', padding: '.4rem 1rem', fontSize: '.75rem', marginTop: 0 }} onClick={() => advanceBooking(bk._id)}>{bk.step < 4 ? 'Start Work' : 'Complete Work'}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default TechnicianDashboard;


