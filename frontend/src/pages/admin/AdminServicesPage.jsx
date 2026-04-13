import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { resolveImagePath } from '../../utils/imagePath';

const AdminServicesPage = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        price: '',
        estimatedTime: '',
        description: '',
        includes: '', // comma separated for input
        servicePoints: 0,
        isActive: true,
        image: null
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [svcRes, catRes] = await Promise.all([
                api.get('/services'),
                api.get('/categories')
            ]);
            setServices(svcRes.data);
            setCategories(catRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (svc) => {
        setEditingService(svc);
        setFormData({
            categoryId: svc.categoryId?._id || svc.categoryId || '',
            name: svc.name,
            price: svc.price,
            estimatedTime: svc.estimatedTime || '',
            description: svc.description || '',
            includes: (svc.includes || []).join(', '),
            servicePoints: svc.servicePoints || 0,
            isActive: svc.isActive !== false,
            image: null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this service?')) return;
        try {
            await api.delete(`/services/${id}`);
            toast.success('Service removed');
            fetchData();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[CMS] Starting upload...', formData);
        const data = new FormData();
        
        // Process includes into array
        const includesArr = formData.includes.split(',').map(i => i.trim()).filter(i => i !== '');
        
        // Append all fields except 'includes' and 'image' (if null)
        Object.keys(formData).forEach(key => {
            if (key === 'includes') {
                includesArr.forEach(i => data.append('includes', i));
            } else if (key === 'image') {
                if (formData.image) {
                    console.log('[CMS] Appending image file:', formData.image.name);
                    data.append('image', formData.image);
                }
            } else if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingService) {
                console.log('[CMS] Sending PUT to:', `/services/${editingService._id}`);
                await api.put(`/services/${editingService._id}`, data);
                toast.success('Service updated');
            } else {
                console.log('[CMS] Sending POST to:', '/services');
                await api.post('/services', data);
                toast.success('Service created');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('[CMS] Save failed:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Save failed. Check console for details.');
        }
    };

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Loading Services...</p></div>;

    return (
        <div className="main fu">
            <div className="sec-tag">Admin CMS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="sec-title" style={{ margin: 0 }}>🛠 Manage Services</h2>
                <button className="bp" style={{ width: 'auto', marginTop: 0 }} onClick={() => { setEditingService(null); setIsModalOpen(true); setFormData({ categoryId: '', name: '', price: '', estimatedTime: '', description: '', includes: '', servicePoints: 0, isActive: true, image: null }); }}>+ Add New Service</button>
            </div>

            <div className="token-queue-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '.7rem', color: 'var(--text-muted)' }}>SERVICE</th>
                            <th style={{ padding: '1rem', fontSize: '.7rem', color: 'var(--text-muted)' }}>CATEGORY</th>
                            <th style={{ padding: '1rem', fontSize: '.7rem', color: 'var(--text-muted)' }}>PRICE</th>
                            <th style={{ padding: '1rem', fontSize: '.7rem', color: 'var(--text-muted)' }}>STATUS</th>
                            <th style={{ padding: '1rem', fontSize: '.7rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(s => (
                            <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                                            <img src={resolveImagePath(s.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '.88rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{s.estimatedTime}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '.8rem' }}>{s.categoryId?.name || 'Uncategorized'}</td>
                                <td style={{ padding: '1rem', fontWeight: 800 }}>₹{s.price}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`status-pill ${s.isActive !== false ? 's-confirmed' : 's-waiting'}`}>
                                        {s.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="bg" style={{ padding: '0.3rem 0.6rem', fontSize: '.65rem' }} onClick={() => handleEdit(s)}>Edit</button>
                                        <button className="bg" style={{ padding: '0.3rem 0.6rem', fontSize: '.65rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }} onClick={() => handleDelete(s._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: 24, width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h3 className="sec-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="fg">
                                <label className="fl">Service Name</label>
                                <input className="fi" required placeholder="e.g. PC Hardware Repair" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="fg">
                                    <label className="fl">Category</label>
                                    <select className="fi" required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="fg">
                                    <label className="fl">Price (₹)</label>
                                    <input className="fi" type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="fg">
                                    <label className="fl">Estimated Time</label>
                                    <input className="fi" placeholder="e.g. 1-2 hrs" value={formData.estimatedTime} onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })} />
                                </div>
                                <div className="fg">
                                    <label className="fl">Image Upload</label>
                                    <input className="fi" type="file" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                                </div>
                            </div>
                            <div className="fg">
                                <label className="fl">Description</label>
                                <textarea className="fi" style={{ height: '80px', padding: '0.8rem' }} placeholder="Detail what the service includes..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="fg">
                                <label className="fl">What's Included? (Comma separated)</label>
                                <input className="fi" placeholder="Cleaning, Thermal Paste, Testing..." value={formData.includes} onChange={e => setFormData({ ...formData, includes: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                    <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Is Active?</span>
                                </label>
                                <div className="fg" style={{ flex: 1, margin: 0 }}>
                                    <label className="fl" style={{ marginBottom: 4 }}>Service Points</label>
                                    <input className="fi" type="number" value={formData.servicePoints} onChange={e => setFormData({ ...formData, servicePoints: e.target.value })} style={{ height: 36 }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="bg" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="bp" style={{ flex: 1, marginTop: 0 }}>{editingService ? 'Update' : 'Create'} Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServicesPage;
