import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const CreateStaffModal = ({ isOpen, onClose, onSuccess }) => {
    const [role, setRole] = useState('ServicePoint');
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', location: '', distanceKm: 5 });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.password) {
            toast.error('Name, Phone and Password are required');
            return;
        }

        setLoading(true);
        try {
            if (role === 'Technician') {
                await api.post('/technicians', {
                    name: form.name,
                    phone: form.phone,
                    role: 'Technician',
                    email: form.email,
                    password: form.password,
                    location: form.location || 'Kakinada',
                    distanceKm: form.distanceKm,
                    status: 'available'
                });
            } else {
                await api.post('/admin/staff', {
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    password: form.password,
                    role: 'ServicePoint'
                });
            }
            toast.success(`${role} account created successfully!`);
            setForm({ name: '', email: '', phone: '', password: '', location: '', distanceKm: 5 });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1200 }}>
            <div className="modal" style={{ maxWidth: '450px' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>Create Staff Account</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Provision a new ServicePoint or Technician profile</div>
                </div>

                <div className="auth-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button className={`role-tab ${role === 'ServicePoint' ? 'on' : ''}`} onClick={() => setRole('ServicePoint')} style={{ flex: 1, textAlign: 'center' }}>ServicePoint</button>
                    <button className={`role-tab ${role === 'Technician' ? 'on' : ''}`} onClick={() => setRole('Technician')} style={{ flex: 1, textAlign: 'center' }}>Technician</button>
                </div>

                <div className="fg"><label>Full Name</label><input className="fi" placeholder="Jane Doe" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="fg"><label>Mobile Number *</label><input className="fi" placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                    <div className="fg"><label>Email Address</label><input className="fi" placeholder="Optional" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                </div>

                {role === 'Technician' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div className="fg"><label>Operating Location</label><input className="fi" placeholder="e.g. Kakinada Central" value={form.location} onChange={e => set('location', e.target.value)} /></div>
                        <div className="fg"><label>Coverage (km)</label><input type="number" className="fi" value={form.distanceKm} onChange={e => set('distanceKm', e.target.value)} /></div>
                    </div>
                )}
                
                <div className="fg"><label>Login Password *</label><input type="password" className="fi" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} /></div>
                
                <button className="bp" onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : `Create ${role} Account →`}</button>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default CreateStaffModal;
