import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import TechnicianCard from '../../components/ui/TechnicianCard';
import TokenSlip from '../../components/ui/TokenSlip';
import BookingSlip from '../../components/ui/BookingSlip';
import CreateStaffModal from '../../components/modals/CreateStaffModal';

const sCls = s => ({ waiting: 's-waiting', inprogress: 's-inprogress', confirmed: 's-confirmed', done: 's-done' })[s] || 's-waiting';

const NOTIF_TYPE_ICON = {
    new_booking:      '🆕',
    booking_accepted: '✅',
    booking_rejected: '❌',
    job_completed:    '🎉',
    general:          '🔔',
};
const NOTIF_TYPE_COLOR = {
    new_booking:      { bg: 'rgba(234,179,8,.08)', border: 'rgba(234,179,8,.3)', text: '#92400e' },
    booking_accepted: { bg: 'rgba(34,197,94,.07)', border: 'rgba(34,197,94,.25)', text: '#15803d' },
    booking_rejected: { bg: 'rgba(239,68,68,.07)', border: 'rgba(239,68,68,.2)',  text: '#b91c1c' },
    job_completed:    { bg: 'rgba(244,63,94,.06)', border: 'rgba(244,63,94,.2)',   text: '#9f1239' },
    general:          { bg: 'var(--bg-subtle)',     border: 'var(--border)',        text: 'var(--text-secondary)' },
};

const TokenQueuePage = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('tokens'); // 'tokens' | 'bookings' | 'technicians' | 'notifications'
    const [tokens, setTokens] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [picks, setPicks] = useState({}); // tokenId -> Set of serviceIds
    const [techPick, setTechPick] = useState({}); // tokenId -> technicianId
    const [manualPrices, setManualPrices] = useState({}); // tokenId -> Number (manual override)
    const [isDirectBookingOpen, setIsDirectBookingOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [directForm, setDirectForm] = useState({ name: '', phone: '', address: '', workDescription: '', serviceIds: [], technicianId: '', manualPrice: '', slot: '' });
    const [tokenOverwrites, setTokenOverwrites] = useState({}); // tokenId -> { name, phone, address, slot }
    const [progressInput, setProgressInput] = useState({}); // bookingId -> String
    const [editingBk, setEditingBk] = useState(null); // bookingId being edited
    const [couponInput, setCouponInput] = useState('');
    const [discountInfo, setDiscountInfo] = useState(null); // { amount, code }
    const [editWorks, setEditWorks] = useState({}); // bookingId -> workDescription string
    const [printingToken, setPrintingToken] = useState(null);
    const [printingBooking, setPrintingBooking] = useState(null);
    // ── Notifications ──
    const [adminNotifications, setAdminNotifications] = useState([]);
    const [notifsLoading, setNotifsLoading] = useState(false);
    const tokenSlipRef = useRef(null);
    const bookingSlipRef = useRef(null);

    const handlePrintToken = useReactToPrint({ contentRef: tokenSlipRef, documentTitle: `ATNIS-Token-Slip`, onAfterPrint: () => setPrintingToken(null) });
    const handlePrintBooking = useReactToPrint({ contentRef: bookingSlipRef, documentTitle: `ATNIS-Booking-Receipt`, onAfterPrint: () => setPrintingBooking(null) });

    const triggerTokenPrint = (tkn) => { setPrintingToken(tkn); setTimeout(() => handlePrintToken(), 200); };
    const triggerBookingPrint = (bk) => { setPrintingBooking(bk); setTimeout(() => handlePrintBooking(), 200); };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [tokRes, techRes, catRes, svcRes, bksRes] = await Promise.all([
                api.get('/tokens'),
                api.get('/technicians'),
                api.get('/categories'),
                api.get('/services'),
                api.get('/bookings')
            ]);
            setTokens(tokRes.data);
            setTechnicians(techRes.data);
            setCategories(catRes.data);
            setAllServices(svcRes.data);
            setBookings(bksRes.data);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            setNotifsLoading(true);
            const { data } = await api.get('/notifications');
            setAdminNotifications(data);
        } catch (e) {}
        finally { setNotifsLoading(false); }
    };

    useEffect(() => {
        fetchAll();
        fetchNotifications();
        // Auto-poll notifications every 6s
        const notifInterval = setInterval(fetchNotifications, 6000);
        return () => clearInterval(notifInterval);
    }, []);

    const updStatus = async (code, status) => {
        try {
            await api.put(`/tokens/${code}/status`, { status });
            toast.success(`Marked as ${status}`);
            fetchAll();
        } catch { toast.error('Update failed'); }
    };

    const advanceBooking = async (id) => {
        try {
            await api.put(`/bookings/${id}/advance`);
            toast.success('Step advanced');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to advance'); }
    };

    const generateInvoice = async (id) => {
        try {
            await api.put(`/bookings/${id}/invoice`);
            toast.success('Invoice generated & sent to user!');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate invoice'); }
    };

    const addProgress = async (id) => {
        if (!progressInput[id]) return;
        try {
            await api.put(`/bookings/${id}/progress`, { note: progressInput[id] });
            toast.success('Progress updated');
            setProgressInput(p => ({ ...p, [id]: '' }));
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update progress'); }
    };

    const createDirect = async () => {
        if (!directForm.name || !directForm.phone || directForm.serviceIds.length === 0) {
            toast.error('Name, Phone and Services are required');
            return;
        }
        try {
            await api.post('/bookings/direct', directForm);
            toast.success('Direct booking created!');
            setIsDirectBookingOpen(false);
            setDirectForm({ name: '', phone: '', address: '', workDescription: '', serviceIds: [], technicianId: '', manualPrice: '', slot: '' });
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create booking'); }
    };

    const applyCoupon = async (id, price) => {
        if (!couponInput) return;
        try {
            const res = await api.post('/bookings/apply-coupon', { code: couponInput, price });
            setDiscountInfo({ amount: res.data.discountAmount, code: res.data.couponCode });
            toast.success('Coupon applied!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        }
    };


    const updateBookingDetails = async (id) => {
        try {
            const data = {
                technicianId: techPick[id],
                manualPrice: manualPrices[id],
                discountAmount: discountInfo?.amount,
                couponCode: discountInfo?.code,
                workDescription: editWorks[id]
            };
            await api.put(`/bookings/${id}/details`, data);
            toast.success('Booking details updated');
            setEditingBk(null);
            setDiscountInfo(null);
            setCouponInput('');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    };

    const deleteToken = async (code) => {
        if (!window.confirm('Are you sure you want to delete this token?')) return;
        try {
            await api.delete(`/tokens/${code}`);
            toast.success('Token deleted');
            fetchAll();
        } catch { toast.error('Delete failed'); }
    };

    const deleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            toast.success('Booking deleted');
            fetchAll();
        } catch { toast.error('Delete failed'); }
    };

    const toggleTechStatus = async (id) => {
        try {
            await api.put(`/technicians/${id}/status`);
            toast.success('Technician status updated');
            fetchAll();
        } catch (err) { toast.error('Failed to update status'); }
    };

    const deleteTechnician = async (id) => {
        if (!window.confirm('Are you sure you want to delete this technician?')) return;
        try {
            await api.delete(`/technicians/${id}`);
            toast.success('Technician deleted');
            fetchAll();
        } catch (err) { toast.error('Failed to delete technician'); }
    };

    const toggleSvc = (tokenId, svcId, isDirect = false) => {
        if (isDirect) {
            setDirectForm(f => {
                const s = new Set(f.serviceIds);
                s.has(svcId) ? s.delete(svcId) : s.add(svcId);
                return { ...f, serviceIds: [...s] };
            });
        } else {
            setPicks(p => {
                const s = new Set(p[tokenId] || []);
                s.has(svcId) ? s.delete(svcId) : s.add(svcId);
                return { ...p, [tokenId]: s };
            });
        }
    };

    const confirmBooking = async (token) => {
        const svcIds = [...(picks[token._id] || new Set())];
        if (svcIds.length === 0) { toast.error('Please select at least one service.'); return; }
        const techId = techPick[token._id];
        if (!techId) { toast.error('Please assign a technician.'); return; }
        
        const ov = tokenOverwrites[token._id] || {};
        
        try {
            await api.put(`/tokens/${token.code}/confirm`, { 
                technicianId: techId, 
                serviceIds: svcIds,
                manualPrice: manualPrices[token._id],
                slot: ov.slot || '',
                customerName: ov.name || token.name,
                customerPhone: ov.phone || token.phone,
                customerAddress: ov.address || token.address
            });
            toast.success('Token converted to live booking!');
            fetchAll();
            setExpanded(null);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to confirm token booking'); }
    };

    const { user } = useAuth();

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Loading Dashboard...</p></div>;

    const unreadNotifCount = adminNotifications.filter(n => !n.isRead).length;
    const newBookingNotifCount = adminNotifications.filter(n => !n.isRead && n.type === 'new_booking').length;

    const groupedByCategory = categories.map(cat => {
        const catServices = allServices.filter(s => {
            const sCatId = (s.categoryId?._id || s.categoryId)?.toString();
            const targetId = (cat._id || cat.id)?.toString();
            return sCatId === targetId;
        });
        return { ...cat, services: catServices };
    }).filter(c => c.services.length > 0);

    const markAdminNotifRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setAdminNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch {}
    };

    const markAllAdminNotifsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setAdminNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch {}
    };

    const deleteAdminNotif = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setAdminNotifications(prev => prev.filter(n => n._id !== id));
        } catch {}
    };

    return (
        <>
            {/* Hidden printable targets (off-screen) */}
            {printingToken && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                    <TokenSlip ref={tokenSlipRef} token={printingToken} hideActions={true} />
                </div>
            )}
            {printingBooking && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                    <BookingSlip ref={bookingSlipRef} booking={printingBooking} hideActions={true} />
                </div>
            )}

            <div className="main fu">
                <div className="sec-tag">{user?.role === 'Admin' ? 'Admin Control' : 'Bookings Hub'}</div>
                <h2 className="sec-title">{user?.role === 'Admin' ? '🔑 Admin Dashboard' : '🛠 Service Point Bookings'}</h2>
                <p className="sec-sub">{user?.role === 'Admin' ? 'Complete overview of all tokens, bookings, and system operations.' : 'Manage walk-in tokens, track live bookings, and generate invoices.'}</p>

                {/* ── new customer bookings alert banner ── */}
                {newBookingNotifCount > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(234,179,8,.12), rgba(244,63,94,.08))',
                        border: '1.5px solid rgba(234,179,8,.35)',
                        borderRadius: 'var(--radius-md)',
                        padding: '.85rem 1.2rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.75rem',
                        flexWrap: 'wrap',
                        animation: 'fadeUp .3s ease'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>🆕</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#92400e' }}>
                                {newBookingNotifCount} New Customer {newBookingNotifCount === 1 ? 'Request' : 'Requests'} Waiting
                            </div>
                            <div style={{ fontSize: '.74rem', color: '#b45309', marginTop: 2 }}>
                                Customers have placed orders — technicians are being notified to accept
                            </div>
                        </div>
                        <button
                            onClick={() => { setTab('notifications'); markAllAdminNotifsRead(); }}
                            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '.45rem 1rem', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', flexShrink: 0 }}
                        >
                            View Requests →
                        </button>
                    </div>
                )}

                <div className="admin-tab-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className={`auth-tab ${tab === 'tokens' ? 'on' : ''}`} onClick={() => setTab('tokens')}>🎫 Tokens ({tokens.length})</button>
                        <button className={`auth-tab ${tab === 'bookings' ? 'on' : ''}`} onClick={() => setTab('bookings')}>📋 Bookings ({bookings.length})</button>
                        {user?.role === 'Admin' && <button className={`auth-tab ${tab === 'technicians' ? 'on' : ''}`} onClick={() => setTab('technicians')}>👨‍🔧 Technicians ({technicians.length})</button>}
                        {/* Notifications tab with live badge */}
                        <button
                            className={`auth-tab ${tab === 'notifications' ? 'on' : ''}`}
                            onClick={() => setTab('notifications')}
                            style={{ position: 'relative' }}
                        >
                            🔔 Notifications
                            {unreadNotifCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -6, right: -6,
                                    background: 'var(--danger)', color: 'white',
                                    borderRadius: 999, minWidth: 18, height: 18,
                                    padding: '0 4px', fontSize: '.6rem', fontWeight: 800,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid white', fontFamily: 'Inter, sans-serif'
                                }}>{unreadNotifCount > 99 ? '99+' : unreadNotifCount}</span>
                            )}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {user?.role === 'Admin' && <button className="bp" style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1rem', background: 'var(--accent)', borderColor: 'var(--accent-border)' }} onClick={() => setIsStaffModalOpen(true)}>👥 Create Staff</button>}
                        <button className="bp" style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1rem' }} onClick={() => setIsDirectBookingOpen(true)}>+ New Booking</button>
                    </div>
                </div>

                {tab === 'tokens' && (
                    <>
                        {tokens.length === 0 ? (
                            <div className="empty"><span className="ei">🎫</span><p>No walk-in tokens yet.</p></div>
                        ) : (
                            tokens.map(tkn => (
                                <div key={tkn._id} className="token-queue-card">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                                                <span className="tkn-num">{tkn.code || tkn.tokenCode}</span>
                                                <span className={`status-pill ${sCls(tkn.status)}`}>{{ waiting: '⏳ Waiting', inprogress: '📞 In Progress', confirmed: '✅ Confirmed', done: '🎉 Done' }[tkn.status]}</span>
                                                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>📅 {new Date(tkn.createdAt).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                                                <div>👤 <strong style={{ color: 'var(--text-primary)' }}>{tkn.name}</strong> · 📞 {tkn.phone}</div>
                                                <div>📍 {tkn.address}</div>
                                                {tkn.note && <div>🗒 <em>{tkn.note}</em></div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {tkn.status === 'waiting' && (
                                                <button className="bg" style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)' }} onClick={() => updStatus(tkn.code, 'inprogress')}>📞 Mark Called</button>
                                            )}
                                            {user?.role === 'Admin' && tkn.status !== 'confirmed' && tkn.status !== 'done' && (
                                                <button className="bg" style={{ color: 'var(--primary)' }} onClick={() => setExpanded(expanded === tkn._id ? null : tkn._id)}>
                                                    {expanded === tkn._id ? '▲ Close' : '⚙ Book Services'}
                                                </button>
                                            )}
                                            <button className="bg" style={{ color: 'var(--accent)', borderColor: 'rgba(245,158,11,.3)', fontSize: '.75rem' }} onClick={() => triggerTokenPrint(tkn)}>🖨 Print Slip</button>
                                            {user?.role === 'Admin' && (
                                                <button className="bg" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', minWidth: '40px' }} onClick={() => deleteToken(tkn.code)}>🗑</button>
                                            )}
                                        </div>
                                    </div>

                                    {expanded === tkn._id && tkn.status !== 'confirmed' && (
                                        <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border)', paddingTop: '1.2rem', animation: 'fadeUp .25s ease' }}>
                                            <div style={{ background: 'var(--bg-subtle)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                                                <div style={{ fontSize: '.74rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Billing & Customer Details</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                    <div className="fg">
                                                        <label style={{ fontSize: '.65rem' }}>Customer Name</label>
                                                        <input 
                                                            className="fi" 
                                                            style={{ fontSize: '.8rem', padding: '.5rem' }} 
                                                            value={tokenOverwrites[tkn._id]?.name ?? tkn.name} 
                                                            onChange={e => setTokenOverwrites(p => ({ ...p, [tkn._id]: { ...(p[tkn._id] || {}), name: e.target.value } }))} 
                                                        />
                                                    </div>
                                                    <div className="fg">
                                                        <label style={{ fontSize: '.65rem' }}>Phone Number</label>
                                                        <input 
                                                            className="fi" 
                                                            style={{ fontSize: '.8rem', padding: '.5rem' }} 
                                                            value={tokenOverwrites[tkn._id]?.phone ?? tkn.phone} 
                                                            onChange={e => setTokenOverwrites(p => ({ ...p, [tkn._id]: { ...(p[tkn._id] || {}), phone: e.target.value } }))} 
                                                        />
                                                    </div>
                                                    <div className="fg" style={{ gridColumn: '1 / -1' }}>
                                                        <label style={{ fontSize: '.65rem' }}>Address</label>
                                                        <input 
                                                            className="fi" 
                                                            style={{ fontSize: '.8rem', padding: '.5rem' }} 
                                                            value={tokenOverwrites[tkn._id]?.address ?? tkn.address} 
                                                            onChange={e => setTokenOverwrites(p => ({ ...p, [tkn._id]: { ...(p[tkn._id] || {}), address: e.target.value } }))} 
                                                        />
                                                    </div>
                                                    <div className="fg" style={{ gridColumn: '1 / -1' }}>
                                                        <label style={{ fontSize: '.65rem' }}>Working Slot</label>
                                                        <select 
                                                            className="fi" 
                                                            style={{ fontSize: '.8rem', padding: '.5rem' }} 
                                                            value={tokenOverwrites[tkn._id]?.slot || ''} 
                                                            onChange={e => setTokenOverwrites(p => ({ ...p, [tkn._id]: { ...(p[tkn._id] || {}), slot: e.target.value } }))}
                                                        >
                                                            <option value="">Select Slot (Optional)</option>
                                                            <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                                                            <option value="Afternoon (12PM - 3PM)">Afternoon (12PM - 3PM)</option>
                                                            <option value="Evening (3PM - 6PM)">Evening (3PM - 6PM)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.85rem' }}>Select services for <strong style={{ color: 'var(--text-primary)' }}>{tokenOverwrites[tkn._id]?.name || tkn.name}</strong>:</p>
                                            {groupedByCategory.map(cat => (
                                                <div key={cat._id} style={{ marginBottom: '.95rem' }}>
                                                    <div style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '.42rem', letterSpacing: .5 }}>{cat.icon} {cat.name}</div>
                                                    <div className="svc-select-grid">
                                                        {cat.services.map(svc => {
                                                            const picked = (picks[tkn._id] || new Set()).has(svc._id);
                                                            return (
                                                                <div key={svc._id} className={`svc-opt ${picked ? 'picked' : ''}`} onClick={() => toggleSvc(tkn._id, svc._id)}>
                                                                    {picked ? '✔' : '○'}<span style={{ flex: 1 }}>{svc.name}</span>
                                                                    <span style={{ color: 'var(--primary)', fontSize: '.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{svc.price}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            <p style={{ fontSize: '.78rem', color: 'var(--text-secondary)', margin: '.8rem 0 .55rem', fontWeight: 600 }}>Assign Technician:</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: '.5rem', marginBottom: '1rem' }}>
                                                {technicians.map(t => {
                                                    const sel = techPick[tkn._id] === t._id;
                                                    return (
                                                        <div key={t._id} onClick={() => setTechPick(p => ({ ...p, [tkn._id]: t._id }))} style={{ background: sel ? 'var(--primary-light)' : 'var(--bg-white)', border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, padding: '.58rem .8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.58rem', transition: 'all .2s' }}>
                                                            <img src={t.avatar || `https://i.pravatar.cc/40?u=${t._id}`} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}` }} alt="" />
                                                            <div>
                                                                <div style={{ fontSize: '.74rem', fontWeight: 600, color: sel ? 'var(--primary)' : 'var(--text-primary)' }}>{t.name} <span style={{ fontSize: '.65rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '.4rem' }}>📞 {t.phone}</span></div>
                                                                <div style={{ fontSize: '.67rem', color: 'var(--text-secondary)' }}>{t.distanceKm} km · {t.status === 'available' ? '✔ Free' : '⏳ Busy'}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {(picks[tkn._id]?.size || 0) > 0 && (
                                                <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 12, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '.8rem', color: 'var(--primary)', fontWeight: 700 }}>{picks[tkn._id]?.size} service(s) selected</div>
                                                        <div style={{ fontSize: '.86rem', fontWeight: 800, marginTop: '.22rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                                            Total: ₹ 
                                                            <input 
                                                                type="number" 
                                                                value={manualPrices[tkn._id] !== undefined ? manualPrices[tkn._id] : [...(picks[tkn._id] || [])].reduce((s, id) => { const sv = allServices.find(x => x._id === id); return s + (sv?.price || 0); }, 0)} 
                                                                onChange={(e) => setManualPrices(p => ({ ...p, [tkn._id]: e.target.value }))}
                                                                style={{ 
                                                                    background: 'white', 
                                                                    border: '1px solid var(--border)', 
                                                                    color: 'var(--text-primary)', 
                                                                    width: '80px', 
                                                                    padding: '2px 5px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '800'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button className="bp" style={{ width: 'auto', marginTop: 0 }} onClick={() => confirmBooking(tkn)}>✔ Confirm Booking</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </>
                )}

                {tab === 'bookings' && (
                    <>
                        {bookings.length === 0 ? (
                            <div className="empty"><span className="ei">📋</span><p>No active bookings yet.</p></div>
                        ) : (
                            bookings.map(bk => (
                                <div key={bk._id} className="token-queue-card">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                                                <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--primary)' }}>{bk.serviceName}</span>
                                                <span className="chip" style={{ fontSize: '.65rem' }}>{bk.categoryName}</span>
                                                <span className={`status-pill ${bk.step === 5 ? 's-done' : 's-inprogress'}`}>
                                                    {bk.step === 5 ? '✅ Completed' : `⏳ Step ${bk.step}/5`}
                                                </span>
                                                {bk.isInvoiceGenerated && <span className="chip" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>🧾 Invoiced</span>}
                                            </div>
                                            <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                                                <div>👤 <strong style={{ color: 'var(--text-primary)' }}>{bk.customerName}</strong> · 📞 {bk.customerPhone} {bk.slot && <span className="chip" style={{ fontSize: '.6rem' }}>⏰ {bk.slot}</span>}</div>
                                                {bk.riseLocation && <div style={{ fontSize: '.75rem', color: 'var(--accent)' }}>📍 Origin: {bk.riseLocation}</div>}
                                                {bk.workDescription && <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)', padding: '.4rem .6rem', borderRadius: 8, margin: '.4rem 0', color: 'var(--accent)', fontSize: '.78rem' }}><strong>Work Purpose:</strong> {bk.workDescription}</div>}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                                    🛠 Technician: 
                                                    {bk.technicianId ? (
                                                        <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                                                            <strong style={{ color: 'var(--text-secondary)' }}>{bk.technicianId.name}</strong> 
                                                            <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>({bk.technicianId.phone})</span>
                                                        </span>
                                                    ) : <span style={{ color: 'var(--danger)', fontSize: '.75rem' }}>Needed</span>}
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <div>💰 Price: <strong style={{ color: 'var(--text-primary)' }}>₹{bk.price}</strong></div>
                                                    {bk.discountAmount > 0 && <span style={{ color: 'var(--primary)', fontSize: '.75rem' }}>(-₹{bk.discountAmount} {bk.couponCode})</span>}
                                                </div>
                                                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>📅 Booked on {new Date(bk.bookingDate).toLocaleDateString('en-IN')}</div>
                                                
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
                                            {bk.step < 5 && user?.role === 'Admin' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input 
                                                            className="fi" 
                                                            placeholder="Update work progress..." 
                                                            value={progressInput[bk._id] || ''}
                                                            onChange={e => setProgressInput(p => ({ ...p, [bk._id]: e.target.value }))}
                                                            style={{ width: '180px', fontSize: '.75rem', padding: '0.4rem 0.6rem' }}
                                                        />
                                                        <button onClick={() => addProgress(bk._id)} style={{ position: 'absolute', right: '5px', top: '5px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '.7rem' }}>➕</button>
                                                    </div>
                                                    <button className="bg" style={{ padding: '.4rem 1rem', fontSize: '.75rem' }} onClick={() => {
                                                        setEditingBk(editingBk === bk._id ? null : bk._id);
                                                        if (editingBk !== bk._id) setEditWorks(p => ({ ...p, [bk._id]: bk.workDescription || '' }));
                                                    }}>
                                                        {editingBk === bk._id ? 'Cancel' : '⚙ Edit Billing'}
                                                    </button>
                                                    <button className="bp" style={{ width: 'auto', padding: '.4rem 1rem', fontSize: '.75rem', marginTop: 0 }} onClick={() => advanceBooking(bk._id)}>Advance →</button>
                                                </div>
                                            )}
                                            {bk.step === 5 && (
                                                <>
                                                    <button className="bg" style={{ width: 'auto', padding: '.4rem 1rem', fontSize: '.75rem', marginTop: 0, color: 'var(--primary)', borderColor: 'var(--primary-border)' }} onClick={() => navigate('/invoice', { state: { bookingId: bk._id } })}>🧾 Invoice</button>
                                                    <button className="bg" style={{ width: 'auto', padding: '.4rem 1rem', fontSize: '.75rem', marginTop: 0, color: 'var(--accent)', borderColor: 'var(--accent-border)' }} onClick={() => navigate('/invoice', { state: { bookingId: bk._id } })}>⬇ Download PDF</button>
                                                </>
                                            )}

                                            {(user?.role === 'Admin' || user?.role === 'ServicePoint') && (
                                                <button className="bg" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', minWidth: '40px' }} onClick={() => deleteBooking(bk._id)}>🗑 Delete</button>
                                            )}
                                        </div>
                                    </div>

                                    {editingBk === bk._id && (
                                        <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'var(--bg-white)', borderRadius: '12px', border: '1px solid var(--border)', animation: 'fadeUp .2s ease' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '.5rem', fontWeight: 700 }}>ASSIGN TECHNICIAN</label>
                                                    <select 
                                                        value={techPick[bk._id] || bk.technicianId?._id || ''} 
                                                        onChange={(e) => setTechPick(p => ({ ...p, [bk._id]: e.target.value }))}
                                                        style={{ width: '100%', padding: '.6rem', borderRadius: '8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                    >
                                                        <option value="">Select Technician</option>
                                                        {technicians.map(t => <option key={t._id} value={t._id}>{t.name} (📞 {t.phone}) - {t.status}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '.5rem', fontWeight: 700 }}>PRICE & DISCOUNT</label>
                                                    <div style={{ display: 'flex', gap: '.5rem' }}>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Manual Price" 
                                                            value={manualPrices[bk._id] !== undefined ? manualPrices[bk._id] : bk.price}
                                                            onChange={(e) => setManualPrices(p => ({ ...p, [bk._id]: e.target.value }))}
                                                            style={{ flex: 1, padding: '.6rem', borderRadius: '8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                        />
                                                        <div style={{ position: 'relative', flex: 1.5 }}>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Coupon Code" 
                                                                value={couponInput}
                                                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                                style={{ width: '100%', padding: '.6rem', paddingRight: '3.5rem', borderRadius: '8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                            />
                                                            <button 
                                                                onClick={() => applyCoupon(bk._id, manualPrices[bk._id] || bk.price)}
                                                                style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '0 .8rem', borderRadius: '6px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '.7rem', cursor: 'pointer' }}
                                                            >
                                                                Apply
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {discountInfo && (
                                                        <div style={{ fontSize: '.75rem', color: 'var(--primary)', marginTop: '.5rem', fontWeight: 600 }}>
                                                            ✨ Applied {discountInfo.code}: -₹{discountInfo.amount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <label style={{ fontSize: '.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '.5rem', fontWeight: 700 }}>WORK PURPOSE / DESCRIPTION</label>
                                                    <input 
                                                        className="fi" 
                                                        placeholder="e.g. Broken screen, servicing required..." 
                                                        value={editWorks[bk._id] || ''} 
                                                        onChange={e => setEditWorks(p => ({ ...p, [bk._id]: e.target.value }))}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                            <button className="bp" style={{ width: '100%', marginTop: '1.2rem', padding: '.75rem' }} onClick={() => updateBookingDetails(bk._id)}>
                                                Save Billing & Tech Assignment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </>
                )}

                {tab === 'technicians' && user?.role === 'Admin' && (
                    <>
                        {technicians.length === 0 ? (
                            <div className="empty"><span className="ei">👨‍🔧</span><p>No technicians found.</p></div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {technicians.map(t => (
                                    <div key={t._id} className="token-queue-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <img src={t.avatar || `https://i.pravatar.cc/50?u=${t._id}`} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} alt={t.name} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{t.name}</div>
                                                    <span style={{ fontSize: '.68rem', fontWeight: 600, padding: '.2rem .58rem', borderRadius: 999, background: t.status === 'available' ? 'var(--primary-light)' : 'var(--accent-light)', color: t.status === 'available' ? 'var(--primary)' : 'var(--accent)', border: `1px solid ${t.status === 'available' ? 'var(--primary-border)' : 'var(--accent-border)'}` }}>
                                                        {t.status === 'available' ? '✔ Available' : '⏳ Busy'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '.3rem' }}>{t.role}</div>
                                                <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                    <div>📞 {t.phone}</div>
                                                    <div>📍 {t.location} <span className="dist-chip" style={{marginLeft: '0.4rem'}}>🚗 {t.distanceKm} km</span></div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '.2rem' }}>
                                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>⭐ {t.rating?.toFixed(1) || '4.9'}</span>
                                                        <span style={{ color: 'var(--text-muted)' }}>({t.totalReviews || 0} reviews)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {t.bio && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '0.5rem', borderRadius: '8px' }}>"{t.bio}"</div>}
                                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginTop: 'auto' }}>
                                            <button className="bg" style={{ flex: 1, padding: '.4rem', fontSize: '.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => toggleTechStatus(t._id)}>Toggle Status</button>
                                            <button className="bg" style={{ flex: 1, padding: '.4rem', fontSize: '.75rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }} onClick={() => deleteTechnician(t._id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {tab === 'notifications' && (
                    <div style={{ animation: 'fadeUp .3s ease' }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '.5rem' }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    🔔 System Notifications
                                    {unreadNotifCount > 0 && (
                                        <span style={{ marginLeft: '.6rem', background: 'var(--danger)', color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: '.65rem', fontWeight: 800 }}>
                                            {unreadNotifCount} unread
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    Live feed of customer requests, technician acceptances & job updates · auto-refreshes every 6s
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                                <button className="bg" style={{ fontSize: '.76rem' }} onClick={fetchNotifications}>🔄 Refresh</button>
                                {unreadNotifCount > 0 && (
                                    <button className="bg" style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)', fontSize: '.76rem' }} onClick={markAllAdminNotifsRead}>
                                        ✓ Mark All Read
                                    </button>
                                )}
                            </div>
                        </div>

                        {notifsLoading && adminNotifications.length === 0 ? (
                            <div className="empty"><span className="ei">⏳</span><p>Loading notifications...</p></div>
                        ) : adminNotifications.length === 0 ? (
                            <div className="empty"><span className="ei">✨</span><p>No notifications yet. They'll appear here in real time.</p></div>
                        ) : (
                            <div style={{ display: 'grid', gap: '.65rem' }}>
                                {adminNotifications.map(n => {
                                    const icon = NOTIF_TYPE_ICON[n.type] || '🔔';
                                    const color = NOTIF_TYPE_COLOR[n.type] || NOTIF_TYPE_COLOR.general;
                                    return (
                                        <div
                                            key={n._id}
                                            onClick={() => { if (!n.isRead) markAdminNotifRead(n._id); }}
                                            style={{
                                                background: n.isRead ? '#ffffff' : color.bg,
                                                border: `1.5px solid ${n.isRead ? 'var(--border)' : color.border}`,
                                                borderRadius: 'var(--radius-md)',
                                                padding: '1rem 1.2rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem',
                                                cursor: n.isRead ? 'default' : 'pointer',
                                                transition: 'all .2s',
                                                position: 'relative',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            {/* Left accent stripe for unread */}
                                            {!n.isRead && (
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '8px 0 0 8px', background: color.border }} />
                                            )}
                                            <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: 2 }}>{icon}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '.84rem',
                                                    fontWeight: n.isRead ? 500 : 800,
                                                    color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                    lineHeight: 1.5,
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {n.message}
                                                </div>
                                                <div style={{ display: 'flex', gap: '.75rem', marginTop: '.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: '.65rem', fontWeight: 700, padding: '2px 8px',
                                                        borderRadius: 999, background: color.bg, color: color.text,
                                                        border: `1px solid ${color.border}`
                                                    }}>
                                                        {n.type?.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                    <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>
                                                        {new Date(n.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {!n.isRead && (
                                                        <span style={{ fontSize: '.65rem', color: 'var(--primary)', fontWeight: 700 }}>● Unread</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', alignItems: 'flex-end', flexShrink: 0 }}>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={e => { e.stopPropagation(); markAdminNotifRead(n._id); }}
                                                        style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', color: 'var(--primary)', borderRadius: 6, padding: '3px 8px', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
                                                    >✓</button>
                                                )}
                                                <button
                                                    onClick={e => { e.stopPropagation(); deleteAdminNotif(n._id); }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 5px', fontSize: '.72rem', borderRadius: 4 }}
                                                    title="Dismiss"
                                                >✕</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isDirectBookingOpen && (
                <div className="modal-ov" style={{ zIndex: 1000 }} onClick={e => e.target === e.currentTarget && setIsDirectBookingOpen(false)}>
                    <div className="modal" style={{ maxWidth: '650px', width: '95%', position: 'relative', zIndex: 1001 }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>🆕 Direct Customer Booking</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="fg"><label>Customer Name</label><input className="fi" value={directForm.name} onChange={e => setDirectForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div className="fg"><label>Phone Number</label><input className="fi" value={directForm.phone} onChange={e => setDirectForm(f => ({ ...f, phone: e.target.value }))} /></div>
                        </div>
                        <div className="fg"><label>Address</label><input className="fi" value={directForm.address} onChange={e => setDirectForm(f => ({ ...f, address: e.target.value }))} /></div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginTop: '.5rem' }}>
                            <div className="fg"><label>Work Purpose / Description</label><input className="fi" value={directForm.workDescription} onChange={e => setDirectForm(f => ({ ...f, workDescription: e.target.value }))} /></div>
                            <div className="fg">
                                <label>Preferred Time Slot</label>
                                <select className="fi" value={directForm.slot} onChange={e => setDirectForm(f => ({ ...f, slot: e.target.value }))}>
                                    <option value="">Select Slot (Optional)</option>
                                    <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                                    <option value="Afternoon (12PM - 3PM)">Afternoon (12PM - 3PM)</option>
                                    <option value="Evening (3PM - 6PM)">Evening (3PM - 6PM)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '.74rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '.5rem', textTransform: 'uppercase' }}>1. Select Services</div>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-subtle)' }}>
                                    {groupedByCategory.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '.75rem' }}>No services found</div>
                                    ) : (
                                        groupedByCategory.map(cat => (
                                            <div key={cat._id} style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '.3rem', textTransform: 'uppercase' }}>{cat.icon} {cat.name}</div>
                                                <div className="svc-select-grid" style={{ gridTemplateColumns: '1fr' }}>
                                                    {cat.services.map(svc => {
                                                        const picked = directForm.serviceIds.includes(svc._id);
                                                        return (
                                                            <div key={svc._id} className={`svc-opt ${picked ? 'picked' : ''}`} style={{ padding: '.4rem .6rem' }} onClick={() => toggleSvc(null, svc._id, true)}>
                                                                {picked ? '✔' : '○'}<span style={{ fontSize: '.7rem', flex: 1 }}>{svc.name}</span>
                                                                <span style={{ fontSize: '.65rem', color: 'var(--primary)', fontWeight: 700 }}>₹{svc.price}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '.74rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '.5rem', textTransform: 'uppercase' }}>2. Assign Technician</div>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-subtle)' }}>
                                    {technicians.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '.75rem' }}>No technicians found</div>
                                    ) : (
                                        technicians.map(t => {
                                            const sel = directForm.technicianId === t._id;
                                            return (
                                                <div key={t._id} onClick={() => setDirectForm(f => ({ ...f, technicianId: t._id }))} style={{ background: sel ? 'var(--primary-light)' : 'white', border: `1.2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, padding: '.45rem .6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem', transition: 'all .2s' }}>
                                                    <img src={t.avatar || `https://i.pravatar.cc/30?u=${t._id}`} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)' }} alt="" />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '.7rem', fontWeight: 600, color: sel ? 'var(--primary)' : 'var(--text-primary)' }}>{t.name}</div>
                                                        <div style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>{t.distanceKm}km · {t.status}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-light)', padding: '.8rem 1.2rem', borderRadius: 12, border: '1px solid var(--primary-border)' }}>
                            <div className="fg" style={{ marginBottom: 0, flex: 1 }}>
                                <label style={{ fontSize: '.65rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 700 }}>Total Amount (₹)</label>
                                <input 
                                    className="fi" 
                                    type="number" 
                                    style={{ padding: '.3rem .6rem', fontSize: '.85rem', width: '120px', background: 'white' }}
                                    value={directForm.manualPrice || directForm.serviceIds.reduce((s, id) => { const sv = allServices.find(x => x._id === id); return s + (sv?.price || 0); }, 0)} 
                                    onChange={e => setDirectForm(f => ({ ...f, manualPrice: e.target.value }))} 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '.8rem' }}>
                                <button className="bg" onClick={() => setIsDirectBookingOpen(false)}>Cancel</button>
                                <button className="bp" onClick={createDirect} style={{ marginTop: 0, padding: '.5rem 1.5rem' }}>Create Booking →</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isStaffModalOpen && (
                <CreateStaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSuccess={fetchAll} />
            )}
        </>
    );
};

export default TokenQueuePage;
