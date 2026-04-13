import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import ServiceDetailCard from '../components/ui/ServiceDetailCard';
import TechnicianCard from '../components/ui/TechnicianCard';
import AuthModal from '../components/modals/AuthModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { resolveImagePath } from '../utils/imagePath';
import './ServiceDetailPage.css';

const TechModal = ({ catId, categoryName, onClose }) => {
    const [techs, setTechs] = useState([]);
    const [techLoading, setTechLoading] = useState(true);

    useEffect(() => {
        api.get('/technicians')
            .then(r => {
                const filtered = r.data.filter(t =>
                    t.categories?.some(c => c._id === catId || c === catId)
                );
                setTechs(filtered);
            })
            .catch(() => {})
            .finally(() => setTechLoading(false));
    }, [catId]);

    return (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 660 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{categoryName} Technicians</h3>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>📍 Nearest first · Kakinada</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                </div>
                <div className="map-box">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=700&q=70" alt="Map" className="map-img" />
                    <div className="map-pin">📍</div>
                    <div className="map-ov" style={{ background: 'linear-gradient(transparent, rgba(255,255,255,.95))', color: 'var(--text-secondary)', fontWeight: 600 }}>🗺 Kakinada City · All technicians within 5 km radius</div>
                </div>
                <div style={{ marginTop: '1.3rem' }}>
                    {techLoading ? (
                        <div className="empty"><span className="ei">⏳</span><p>Loading technicians...</p></div>
                    ) : techs.length === 0 ? (
                        <div className="empty"><span className="ei">👷</span><p>No technicians for this category yet.</p></div>
                    ) : (
                        techs.map((t, i) => <TechnicianCard key={t._id} technician={t} idx={i} />)
                    )}
                </div>
            </div>
        </div>
    );
};

const ServiceDetailPage = () => {
    const { catId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [category, setCategory] = useState(null);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [showTechModal, setShowTechModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [bookingAddress, setBookingAddress] = useState('');
    const [bookingService, setBookingService] = useState(null);
    const [authOpen, setAuthOpen] = useState(false);
    const [authCallback, setAuthCallback] = useState(null);

    const slots = [
        '09:00 AM - 11:00 AM',
        '11:00 AM - 01:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM'
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadError(false);
                const [catRes, bkRes] = await Promise.all([
                    api.get(`/categories/${catId}`),
                    user ? api.get('/bookings/my') : Promise.resolve({ data: [] })
                ]);
                setCategory(catRes.data.category);
                setServices(catRes.data.services);
                setBookings(bkRes.data);
            } catch {
                setLoadError(true);
                toast.error('Failed to load services for this category');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [catId, user]);

    // Re-fetch bookings when user logs in
    useEffect(() => {
        if (user && category) {
            api.get('/bookings/my')
                .then(r => setBookings(r.data))
                .catch(() => {});
        }
    }, [user]);

    const isBooked = svcId => bookings.some(b => b.service?._id === svcId || b.serviceId === svcId);
    const getBooking = svcId => bookings.find(b => b.service?._id === svcId || b.serviceId === svcId);

    const handleBookService = (service) => {
        if (!user) {
            setAuthOpen(true);
            return;
        }
        setBookingService(service);
        setSelectedSlot('');
        setBookingAddress(user?.address || '');
    };

    const confirmBooking = async () => {
        if (!selectedSlot) { toast.error('Please select a time slot'); return; }
        if (!bookingAddress.trim()) { toast.error('Please enter your service address'); return; }
        try {
            const res = await api.post('/bookings', {
                serviceId: bookingService._id,
                categoryId: category._id,
                source: 'self',
                slot: selectedSlot,
                address: bookingAddress.trim()
            });
            setBookings(prev => [...prev, res.data]);
            setBookingService(null);
            toast.success('Booking confirmed! Technicians have been notified.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create booking. Try again.');
        }
    };

    const handleCancel = async (svcId) => {
        const bk = getBooking(svcId);
        if (!bk) return;
        try {
            await api.delete(`/bookings/${bk._id}`);
            setBookings(prev => prev.filter(b => b._id !== bk._id));
            toast.success('Booking cancelled.');
        } catch {
            toast.error('Could not cancel booking.');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>⏳</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>Loading services...</p>
            </div>
        );
    }

    if (loadError || !category) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>❌</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>Category not found or failed to load.</p>
                <button className="bp" style={{ width: 'auto', padding: '.6rem 1.5rem' }} onClick={() => navigate('/services')}>
                    ← Back to Services
                </button>
            </div>
        );
    }

    const heroImg = category.id === 'networking'
        ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=85'
        : resolveImagePath(category.image, 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=1400&q=85');

    return (
        <div className="svc-page">
            {/* Banner */}
            <div className="svc-hero" style={{ height: 340 }}>
                <img src={heroImg} alt={category.name} className="svc-hero-img" onError={e => { e.target.style.display = 'none'; }} />
                <div className="svc-hero-ov" style={{ background: 'linear-gradient(to top, rgba(15,23,42,.9) 0%, rgba(15,23,42,.4) 50%, rgba(15,23,42,.1) 100%)' }} />
                <div className="svc-hero-content">
                    <button className="back-btn" onClick={() => navigate('/services')}>← Back to Categories</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '3rem' }}>{category.icon}</span>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '.3rem', letterSpacing: '-.5px' }}>{category.name}</h1>
                            <p style={{ color: '#e2e8f0', fontSize: '1rem', maxWidth: '600px' }}>{category.tagline || 'Professional services for your home & business'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="chip" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>📋 {services.length} Services</span>
                        <span className="chip" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>✅ Certified Technicians</span>
                        <button
                            className="bg"
                            style={{ fontSize: '.8rem', padding: '.4rem 1.2rem', color: '#fff', borderColor: 'rgba(255,255,255,.3)', background: 'rgba(255,255,255,.05)' }}
                            onClick={() => setShowTechModal(true)}
                        >
                            👷 View Technicians
                        </button>
                    </div>
                </div>
            </div>

            <div className="main page-enter">
                {/* HOW IT WORKS */}
                <div style={{ marginBottom: '4rem' }}>
                    <div className="sec-tag">HOW IT WORKS</div>
                    <h2 className="sec-title">Book in 4 Simple Steps</h2>
                    <div className="process-steps">
                        {[
                            { n: '1', l: 'Choose Service', s: 'Pick from our catalogue below' },
                            { n: '2', l: 'Confirm Booking', s: 'We verify and assign a technician' },
                            { n: '3', l: 'Technician Arrives', s: 'Within 4–24 hours to your location' },
                            { n: '4', l: 'Job Done & Pay', s: 'Pay only after you\'re satisfied' }
                        ].map((step, i, arr) => (
                            <div key={step.n} className="ps-item">
                                <div className="ps-num">{step.n}</div>
                                <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: '.2rem', color: 'var(--text-primary)' }}>{step.l}</div>
                                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{step.s}</div>
                                {i < arr.length - 1 && <div className="ps-arrow" style={{ position: 'absolute', right: '-10%', top: '22px', color: 'var(--border)', fontSize: '1.2rem' }}>→</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SERVICE CARDS */}
                <div className="sec-tag">AVAILABLE SERVICES</div>
                <h2 className="sec-title">{category.name} Services</h2>
                <p className="sec-sub">All services include a free inspection · Work guaranteed · Technicians arrive within 4–24 hrs</p>

                {!user && (
                    <div style={{
                        background: 'var(--accent-light)',
                        border: '1.5px solid var(--accent-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem 1.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>🔒</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--accent)', marginBottom: '.2rem' }}>Login to Book</div>
                            <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Browse all {services.length} services below. Create a free account to book any service instantly.</div>
                        </div>
                        <button
                            className="btn-get-token"
                            style={{ background: 'var(--primary)', fontSize: '.85rem', padding: '.65rem 1.4rem' }}
                            onClick={() => setAuthOpen(true)}
                        >
                            Login / Register →
                        </button>
                    </div>
                )}

                {services.length === 0 ? (
                    <div className="empty" style={{ marginTop: '2rem' }}>
                        <span className="ei">🔧</span>
                        <p>No services found for this category.</p>
                        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>Please run the database seed script to populate services.</p>
                    </div>
                ) : (
                    <div className="svc-detail-grid">
                        {services.map((svc) => (
                            <ServiceDetailCard
                                key={svc._id}
                                service={svc}
                                onBook={handleBookService}
                                isBooked={isBooked(svc._id)}
                                onCancel={() => handleCancel(svc._id)}
                                onShowTechs={() => setShowTechModal(true)}
                                isLoggedIn={!!user}
                            />
                        ))}
                    </div>
                )}

                {/* WHY ATNIS */}
                <div style={{ marginTop: '4rem' }}>
                    <div className="sec-tag">WHY ATNIS?</div>
                    <h2 className="sec-title">What Makes Us Different</h2>
                    <div className="why-grid">
                        {[
                            ['🎓', 'Certified Experts', 'All technicians are certified, trained and background-verified'],
                            ['⚡', 'Fast Response', 'Technician at your door within 4–24 hours of booking'],
                            ['🛡️', 'Work Guarantee', 'All jobs come with a service warranty and quality assurance'],
                            ['💰', 'Transparent Pricing', 'Fixed upfront pricing — no hidden charges or surprises'],
                            ['📍', 'Local & Nearby', 'Kakinada-based technicians, sorted by distance from you'],
                            ['🌟', '500+ Happy Jobs', 'Proven track record with 4.8★ average customer rating']
                        ].map(([icon, title, desc]) => (
                            <div key={title} className="why-card">
                                <span className="why-icon">{icon}</span>
                                <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: '.4rem', color: 'var(--text-primary)' }}>{title}</div>
                                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showTechModal && <TechModal catId={category._id} categoryName={category.name} onClose={() => setShowTechModal(false)} />}

            <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); }} />

            {bookingService && (
                <div className="modal-ov" onClick={e => e.target === e.currentTarget && setBookingService(null)}>
                    <div className="modal" style={{ maxWidth: 440 }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '.5rem', color: 'var(--text-primary)' }}>Book Service</h3>
                        <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                            Booking <strong>{bookingService.name}</strong> · ₹{bookingService.price?.toLocaleString('en-IN')}
                        </p>

                        {/* Address */}
                        <div className="fg">
                            <label>Your Service Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                className="fi"
                                placeholder="e.g. 12-3-45, MG Road, Kakinada"
                                value={bookingAddress}
                                onChange={e => setBookingAddress(e.target.value)}
                            />
                        </div>

                        {/* Slot */}
                        <div className="fg" style={{ marginBottom: '.5rem' }}>
                            <label>Preferred Time Slot <span style={{ color: 'var(--danger)' }}>*</span></label>
                        </div>
                        <div style={{ display: 'grid', gap: '.6rem', marginBottom: '1.5rem' }}>
                            {slots.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedSlot(s)}
                                    style={{
                                        padding: '.85rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1.5px solid',
                                        borderColor: selectedSlot === s ? 'var(--primary)' : 'var(--border)',
                                        background: selectedSlot === s ? 'var(--primary-light)' : 'var(--bg-white)',
                                        color: selectedSlot === s ? 'var(--primary)' : 'var(--text-primary)',
                                        fontSize: '.88rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left',
                                        fontWeight: selectedSlot === s ? 700 : 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '.5rem'
                                    }}
                                >
                                    <span>{selectedSlot === s ? '🟢' : '⏰'}</span> {s}
                                </button>
                            ))}
                        </div>

                        {/* Info banner */}
                        <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: 8, padding: '.65rem .85rem', marginBottom: '1.25rem', fontSize: '.75rem', color: '#92400e' }}>
                            🔔 Once confirmed, all available technicians will be notified. The first to accept gets the job!
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="bg" style={{ flex: 1 }} onClick={() => setBookingService(null)}>Cancel</button>
                            <button className="bp" style={{ flex: 1, marginTop: 0 }} onClick={confirmBooking}>Confirm & Notify →</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceDetailPage;
