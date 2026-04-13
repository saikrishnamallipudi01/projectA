import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BookingSlip from '../components/ui/BookingSlip';
import './BookingsPage.css';

const WF = ['Request', 'Verify', 'Assigned', 'Execution', 'Complete'];

const BookingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [printingBooking, setPrintingBooking] = useState(null);
    const slipRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: slipRef,
        documentTitle: `ATNIS-Booking-Slip`,
        onAfterPrint: () => setPrintingBooking(null),
    });

    const triggerPrint = (booking) => {
        setPrintingBooking(booking);
        // Small timeout to allow the DOM to render before printing
        setTimeout(() => {
            handlePrint();
        }, 200);
    };

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            toast.success('Booking cancelled successfully');
            setBookings(prev => prev.filter(b => b._id !== id));
        } catch {
            toast.error('Could not cancel booking');
        }
    };

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Loading your bookings...</p></div>;

    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Hidden printable slip - rendered off-screen */}
            {printingBooking && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                    <BookingSlip ref={slipRef} booking={printingBooking} hideActions={true} />
                </div>
            )}

            <div className="main">
                <div className="sec-tag">Track</div>
                <h2 className="sec-title">My Bookings</h2>
                <p className="sec-sub">Real-time tracking for every service request</p>

                {bookings.length === 0 ? (
                    <div className="empty">
                        <span className="ei">📋</span>
                        <p>No bookings yet. Browse Services to get started!</p>
                        <Link to="/" className="btn-hero" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1.2rem', padding: '.88rem 1.8rem', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>Browse Services →</Link>
                    </div>
                ) : (
                    bookings.map(b => (
                        <div key={b._id} className="bk-card">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <img
                                    src={b.serviceImage || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&q=70'}
                                    alt=""
                                    style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)' }}>{b.serviceName || 'Service Fee'}</div>
                                    <div style={{ fontSize: '.76rem', color: 'var(--text-muted)', marginTop: '.18rem' }}>
                                        {b.categoryIcon} {b.categoryName} · #{b._id.slice(-6).toUpperCase()} · {new Date(b.bookingDate).toLocaleDateString('en-IN')}
                                    </div>
                                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '.86rem', marginTop: '.28rem' }}>₹ {b.price?.toLocaleString('en-IN') || '—'}</div>
                                    {b.technicianId && (
                                        <div style={{ marginTop: '.45rem', display: 'flex', alignItems: 'center', gap: '.45rem', fontSize: '.75rem', color: 'var(--text-muted)' }}>
                                            <img src={b.technicianId.avatar || `https://i.pravatar.cc/40?u=${b.technicianId._id}`} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid var(--border)' }} alt="" />
                                            <span>Assigned: <strong style={{ color: 'var(--text-secondary)' }}>{b.technicianId.name}</strong></span>
                                            {b.technicianId.phone && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>📞 {b.technicianId.phone}</span>}
                                            {b.technicianId.distanceKm && <span className="dist-chip">📍 {b.technicianId.distanceKm} km</span>}
                                        </div>
                                    )}
                                    {b.source === 'token' && <span className="chip-gold" style={{ marginTop: '.4rem', display: 'inline-block' }}>🎫 Token Booking</span>}
                                    {b.progressNotes?.length > 0 && (
                                        <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                            <div style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '.3rem' }}>Work Progress Updates</div>
                                            {b.progressNotes.map((pn, i) => (
                                                <div key={i} style={{ fontSize: '.72rem', color: 'var(--text-secondary)', marginBottom: '.2rem', lineHeight: 1.4 }}>
                                                    • {pn.note} <span style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>({new Date(pn.timestamp).toLocaleTimeString()})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', alignItems: 'flex-end' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.73rem', fontWeight: 700, padding: '.28rem .7rem', borderRadius: 999,
                                        background: b.step < 2 ? 'var(--accent-light)' : b.step < 5 ? 'var(--primary-light)' : 'var(--bg-subtle)',
                                        color: b.step < 2 ? 'var(--accent)' : b.step < 5 ? 'var(--primary)' : 'var(--text-secondary)'
                                    }}>
                                        {b.step < 2 ? '⏳ Pending' : b.step < 5 ? '🔵 In Progress' : '✅ Complete'}
                                    </span>
                                    {b.step === 5 && (
                                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                            <button
                                                className="bg"
                                                style={{ fontSize: '.72rem', padding: '.28rem .68rem', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                                                onClick={() => navigate('/invoice', { state: { bookingId: b._id } })}
                                            >
                                                🧾 Invoice
                                            </button>
                                            <button
                                                className="bg"
                                                style={{ fontSize: '.72rem', padding: '.28rem .68rem', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
                                                onClick={() => navigate('/invoice', { state: { bookingId: b._id } })}
                                            >
                                                ⬇ Download
                                            </button>
                                        </div>
                                    )}

                                    {b.step < 2 && (
                                        <button className="bg" style={{ fontSize: '.72rem', padding: '.28rem .68rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }} onClick={() => handleDelete(b._id)}>Remove</button>
                                    )}
                                </div>
                            </div>
                            <div className="steps" style={{ marginTop: '1.05rem' }}>
                                {WF.map((s, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <div className={`step-line ${b.step > i ? 'done' : ''}`} />}
                                        <div className="step-item">
                                            <div className={`step-dot ${b.step > i ? 'done' : b.step === i + 1 ? 'active' : ''}`}>{b.step > i ? '✓' : i + 1}</div>
                                            <div className={`step-lbl ${b.step > i ? 'done' : ''}`}>{s}</div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingsPage;
