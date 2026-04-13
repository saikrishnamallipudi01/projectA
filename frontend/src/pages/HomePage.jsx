import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import CategoryCard from '../components/ui/CategoryCard';
import TechnicianCard from '../components/ui/TechnicianCard';
import TokenFlowModal from '../components/modals/TokenFlowModal';
import AuthModal from '../components/modals/AuthModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './HomePage.css';

const SLIDES = [
    { img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1400&q=85', tag: '🌐 Networking & IT', title: 'Enterprise-grade\nConnectivity', sub: 'LAN, WAN, Wi-Fi, VPN & Firewall Setup' },
    { img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=85', tag: '⚡ Electrical Works', title: 'Safe & Certified\nElectrical', sub: 'Wiring, DB Boards, Earthing & Audits' },
    { img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400&q=85', tag: '🏡 Smart & Solar', title: 'Future-Ready\nHome Solutions', sub: 'Smart Automation, Solar Panels & CCTV' }
];

const STATS = [
    { n: '500+', l: 'Jobs Done' }, { n: '4.8 ★', l: 'Avg Rating' },
    { n: '48h', l: 'Response Time' }, { n: '8', l: 'Categories' },
    { n: '290+', l: 'Happy Clients' }
];

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slide, setSlide] = useState(0);
    const [tokenOpen, setTokenOpen] = useState(false);
    const [tokenMode, setTokenMode] = useState('get');
    const [authOpen, setAuthOpen] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/categories'), api.get('/technicians')])
            .then(([catRes, techRes]) => { setCategories(catRes.data); setTechnicians(techRes.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
        return () => clearInterval(t);
    }, []);

    const openToken = (mode) => { setTokenMode(mode); setTokenOpen(true); };

    const s = SLIDES[slide];

    return (
        <div>
            {/* ── HERO ── */}
            <div style={{ position: 'relative', height: 'min(480px, 68vh)', overflow: 'hidden' }}>
                <img key={slide} src={s.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn .6s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,.88) 0%, rgba(15,23,42,.5) 50%, rgba(15,23,42,.15) 100%)' }} />
                <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 2.5rem' }}>
                    <div style={{ maxWidth: 540, animation: 'slideR .4s ease' }} key={slide + '-content'}>
                        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 'var(--radius-full)', padding: '.3rem 1rem', fontSize: '.74rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '1rem' }}>{s.tag}</div>
                        <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', lineHeight: 1.2, marginBottom: '.75rem', whiteSpace: 'pre-line', letterSpacing: '-.5px', color: '#ffffff' }}>{s.title}</h1>
                        <p style={{ color: '#cbd5e1', fontSize: '.95rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>{s.sub}</p>
                        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                            <button
                                style={{ background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '.88rem', border: 'none', borderRadius: 'var(--radius-md)', padding: '.85rem 1.75rem', cursor: 'pointer', transition: 'all .2s' }}
                                onClick={() => navigate('/services')}
                            >
                                Browse Services →
                            </button>
                            {user && user.role !== 'Customer' && (
                                <button
                                    style={{ background: 'transparent', color: '#fbbf24', border: '1.5px solid rgba(251,191,36,.35)', borderRadius: 'var(--radius-md)', padding: '.85rem 1.75rem', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', transition: 'all .2s' }}
                                    onClick={() => openToken('get')}
                                >
                                    🎫 Get Token
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Slide indicators */}
                <div style={{ position: 'absolute', bottom: '1.25rem', left: '2.5rem', display: 'flex', gap: '.5rem' }}>
                    {SLIDES.map((_, i) => (
                        <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, border: 'none', background: i === slide ? 'var(--primary)' : 'rgba(255,255,255,.3)', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
                    ))}
                </div>
            </div>

            {/* ── STATS ── */}
            <div className="stats">
                {STATS.map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{s.n}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase' }}>{s.l}</div>
                    </div>
                ))}
            </div>

            <div className="main">
                {/* ── TOKEN CALLOUT (logged-out only) ── */}
                {!user && (
                    <div className="token-callout fu">
                        <div>
                            <div style={{ letterSpacing: 1.5, fontSize: '.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Don't have time to browse?</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '.35rem', color: 'var(--text-primary)' }}>Get a Help Token in 30 Seconds</div>
                            <div style={{ fontSize: '.84rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>No tech skills needed. Just share your details and our team will call &amp; book for you directly.</div>
                        </div>
                        <button className="btn-get-token" onClick={() => setAuthOpen(true)}>🎫 Login to Get Token</button>
                    </div>
                )}

                {/* ── CATEGORY GRID ── */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="sec-tag">Categories</div>
                    <h2 className="sec-title">What Do You Need Fixed?</h2>
                    <p className="sec-sub">Certified technicians across 8 service verticals · Kakinada's trusted platform</p>
                    {loading ? (
                        <div className="empty"><span className="ei">⏳</span><p>Loading categories...</p></div>
                    ) : (
                        <div className="cat-grid">
                            {categories.map(cat => (
                                <CategoryCard 
                                    key={cat._id} 
                                    category={cat} 
                                    onClick={() => navigate(`/services/${cat.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── TECHNICIAN PREVIEW ── */}
                {technicians.length > 0 && (
                    <div>
                        <div className="sec-tag">Our Team</div>
                        <h2 className="sec-title">Our Nearest Experts</h2>
                        <p className="sec-sub">Sorted by distance from Kakinada city centre</p>
                        <div style={{ display: 'grid', gap: '.75rem' }}>
                            {[...technicians].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)).slice(0, 4).map((t, i) => <TechnicianCard key={t._id} technician={t} idx={i} />)}
                        </div>
                        {technicians.length > 4 && (
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <button className="bg" style={{ padding: '.65rem 1.75rem', fontSize: '.84rem' }} onClick={() => navigate('/technicians')}>View All {technicians.length} Experts →</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <TokenFlowModal isOpen={tokenOpen} mode={tokenMode} onClose={() => setTokenOpen(false)} />
            <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
    );
};

export default HomePage;
