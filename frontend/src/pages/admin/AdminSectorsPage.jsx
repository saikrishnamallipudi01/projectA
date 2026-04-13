import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { resolveImagePath } from '../../utils/imagePath';

const AdminSectorsPage = () => {
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        icon: '',
        color: '#3b82f6',
        tagline: '',
        order: 1,
        image: null
    });

    const fetchSectors = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/categories');
            setSectors(data);
        } catch (err) {
            toast.error('Failed to load sectors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSectors();
    }, []);

    const handleEdit = (sector) => {
        setEditingSector(sector);
        setFormData({
            id: sector.id,
            name: sector.name,
            icon: sector.icon || '',
            color: sector.color || '#3b82f6',
            tagline: sector.tagline || '',
            order: sector.order || 1,
            image: null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sector? All services under it will lose their category association.')) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Sector removed');
            fetchSectors();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingSector) {
                await api.put(`/categories/${editingSector._id}`, data);
                toast.success('Sector updated');
            } else {
                await api.post('/categories', data);
                toast.success('Sector created');
            }
            setIsModalOpen(false);
            setEditingSector(null);
            fetchSectors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        }
    };

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Loading Sectors...</p></div>;

    return (
        <div className="main fu">
            <div className="sec-tag">Admin CMS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="sec-title" style={{ margin: 0 }}>📂 Manage Sectors</h2>
                <button className="bp" style={{ width: 'auto', marginTop: 0 }} onClick={() => { setEditingSector(null); setIsModalOpen(true); }}>+ Add New Sector</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {sectors.map(s => (
                    <div key={s._id} className="token-queue-card" style={{ padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 12, background: s.color || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', overflow: 'hidden' }}>
                            {s.image ? <img src={resolveImagePath(s.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : s.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{s.name}</h3>
                            <p style={{ margin: '0.2rem 0', fontSize: '.75rem', color: 'var(--text-muted)' }}>{s.tagline}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button className="bg" style={{ padding: '0.3rem 0.8rem', fontSize: '.7rem' }} onClick={() => handleEdit(s)}>Edit</button>
                                <button className="bg" style={{ padding: '0.3rem 0.8rem', fontSize: '.7rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }} onClick={() => handleDelete(s._id)}>Delete</button>
                            </div>
                        </div>
                        <div style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--primary)' }}>#{s.order}</div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: 24, width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h3 className="sec-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{editingSector ? 'Edit Sector' : 'Add New Sector'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="fg">
                                <label className="fl">Unique ID (e.g. electrical)</label>
                                <input className="fi" required placeholder="Slug format" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })} disabled={editingSector} />
                            </div>
                            <div className="fg">
                                <label className="fl">Display Name</label>
                                <input className="fi" required placeholder="e.g. Electrical Services" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="fg">
                                    <label className="fl">Icon (Emoji)</label>
                                    <input className="fi" placeholder="⚡" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                                </div>
                                <div className="fg">
                                    <label className="fl">Theme Color</label>
                                    <input className="fi" type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ height: '42px', padding: '4px' }} />
                                </div>
                            </div>
                            <div className="fg">
                                <label className="fl">Tagline</label>
                                <input className="fi" placeholder="Brief description..." value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="fg">
                                    <label className="fl">Sort Order</label>
                                    <input className="fi" type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} />
                                </div>
                                <div className="fg">
                                    <label className="fl">Upload Sector Image</label>
                                    <input className="fi" type="file" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="bg" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="bp" style={{ flex: 1, marginTop: 0 }}>{editingSector ? 'Update' : 'Create'} Sector</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSectorsPage;
