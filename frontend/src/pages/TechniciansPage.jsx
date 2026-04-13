import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axiosInstance';
import TechnicianCard from '../components/ui/TechnicianCard';

const TechniciansPage = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const location = useLocation();
    const catId = location.state?.catId;

    useEffect(() => {
        const url = catId ? `/technicians?category=${catId}` : '/technicians';
        api.get(url)
            .then(r => setTechnicians(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [catId]);

    const filtered = filter === 'available'
        ? technicians.filter(t => t.status === 'available')
        : technicians;

    const sorted = [...filtered].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return (
        <div className="main">
            <div className="sec-tag">Certified Pros</div>
            <h2 className="sec-title">Our Experts</h2>
            <p className="sec-sub">ATNIS-certified professionals · Kakinada · Available for instant dispatch</p>

            <div className="tab-bar no-print" style={{ marginBottom: '1.5rem' }}>
                <button className={`tab-btn ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All Experts</button>
                <button className={`tab-btn ${filter === 'available' ? 'on' : ''}`} style={filter === 'available' ? { background: 'var(--primary)', borderColor: 'transparent', color: 'white' } : { borderColor: 'var(--border)', color: 'var(--primary)' }} onClick={() => setFilter('available')}>✔ Available Now</button>
            </div>

            {loading ? (
                <div className="empty"><span className="ei">⏳</span><p>Loading experts...</p></div>
            ) : sorted.length === 0 ? (
                <div className="empty"><span className="ei">🔍</span><p>No technicians found.</p></div>
            ) : (
                <div>
                    {sorted.map((t, i) => <TechnicianCard key={t._id} technician={t} idx={i} />)}
                </div>
            )}
        </div>
    );
};

export default TechniciansPage;
