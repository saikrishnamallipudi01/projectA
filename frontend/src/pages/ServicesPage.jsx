import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import CategoryCard from '../components/ui/CategoryCard';
import TechnicianCard from '../components/ui/TechnicianCard';
import { useAuth } from '../context/AuthContext';
import './ServicesPage.css';

const ServicesPage = () => {
    const [tab, setTab] = useState('services');
    const [categories, setCategories] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([api.get('/categories'), api.get('/technicians')])
            .then(([catRes, techRes]) => {
                setCategories(catRes.data);
                setTechnicians(techRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="main">
                <div className="tab-bar no-print">
                    <button className={`tab-btn ${tab === 'services' ? 'on' : ''}`} onClick={() => setTab('services')}>🛠 Services</button>
                    <button className={`tab-btn ${tab === 'technicians' ? 'on' : ''}`} onClick={() => setTab('technicians')}>👷 Technicians</button>
                </div>

                {tab === 'services' && (
                    <div className="fu">
                        <div className="sec-tag">Browse</div>
                        <h2 className="sec-title">Choose a Category</h2>
                        <p className="sec-sub">Click any category to open the full service page with details, pricing and booking.</p>
                        {loading ? (
                            <div className="empty"><span className="ei">⏳</span><p>Loading...</p></div>
                        ) : categories.length === 0 ? (
                            <div className="empty">
                                <span className="ei">📂</span>
                                <p>No categories found. Please seed the database.</p>
                            </div>
                        ) : (
                            <div className="cat-grid">
                                {categories.map((cat) => (
                                    <CategoryCard
                                        key={cat._id}
                                        category={cat}
                                        onClick={() => navigate(`/services/${cat.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'technicians' && (
                    <div className="fu">
                        <div className="sec-tag">Our Team</div>
                        <h2 className="sec-title">All Technicians</h2>
                        <p className="sec-sub">Sorted by distance · Background-verified</p>
                        {loading ? (
                            <div className="empty"><span className="ei">⏳</span><p>Loading...</p></div>
                        ) : technicians.length === 0 ? (
                            <div className="empty">
                                <span className="ei">👷</span>
                                <p>No technicians added yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '.9rem' }}>
                                {[...technicians]
                                    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
                                    .map((t, i) => (
                                        <TechnicianCard key={t._id} technician={t} idx={i} showPhone={!!user} />
                                    ))}
                            </div>
                        )}
                        {!user && (
                            <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                                🔒 <strong>Login</strong> to see technician contact details.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
