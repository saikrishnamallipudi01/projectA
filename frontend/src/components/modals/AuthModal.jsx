import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('login');
    const { login, register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'Customer' });
    const [err, setErr] = useState('');
    const [ok, setOk] = useState('');
    const [loading, setLoading] = useState(false);

    const [loginRole, setLoginRole] = useState('Admin');

    if (!isOpen) return null;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const doLogin = async () => {
        setErr(''); setOk('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            if (user.role !== loginRole) {
                setErr(`This account is not a ${loginRole}. Please use the correct login type.`);
                setLoading(false);
                return;
            }
            setOk('Welcome back!');
            setTimeout(() => onClose(), 700);
        } catch (e) {
            setErr(e.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const doReg = async () => {
        setErr(''); setOk('');
        if (!form.name || !form.email || !form.phone || !form.password) { setErr('Please fill all fields.'); return; }
        if (form.password !== form.confirm) { setErr('Passwords do not match.'); return; }
        if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role });
            setOk('Account created! Logging in…');
            setTimeout(() => onClose(), 900);
        } catch (e) {
            setErr(e.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--primary)' }}>ATNIS</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Unified Service Portal · Kakinada</div>
                </div>
                <div className="auth-tabs">
                    <button className={`auth-tab ${mode === 'login' ? 'on' : ''}`} onClick={() => { setMode('login'); setErr(''); setOk(''); }}>Login</button>
                    <button className={`auth-tab ${mode === 'register' ? 'on' : ''}`} onClick={() => { setMode('register'); setErr(''); setOk(''); }}>Customer Registration</button>
                </div>
                {err && <div className="err">⚠ {err}</div>}
                {ok && <div className="suc">✓ {ok}</div>}
                {mode === 'login' ? (
                    <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <button className={`role-tab ${loginRole === 'Admin' ? 'on' : ''}`} onClick={() => setLoginRole('Admin')}>Admin</button>
                            <button className={`role-tab ${loginRole === 'ServicePoint' ? 'on' : ''}`} onClick={() => setLoginRole('ServicePoint')}>ServicePoint</button>
                            <button className={`role-tab ${loginRole === 'Technician' ? 'on' : ''}`} onClick={() => setLoginRole('Technician')}>Technician</button>
                            <button className={`role-tab ${loginRole === 'Customer' ? 'on' : ''}`} onClick={() => setLoginRole('Customer')}>Customer</button>
                        </div>
                        <div className="fg">
                            <label>{loginRole === 'Technician' ? 'Mobile Number' : `${loginRole} Email`}</label>
                            <input className="fi" placeholder={loginRole === 'Technician' ? '10-digit mobile number' : 'your@email.com'} value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} />
                        </div>
                        <div className="fg"><label>Password</label><input type="password" className="fi" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} /></div>
                        <button className="bp" onClick={doLogin} disabled={loading}>{loading ? 'Logging in…' : `Login as ${loginRole} →`}</button>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
                            <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--primary)', marginBottom: '.2rem' }}>Create your Customer Account</div>
                            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Fill in the details below to register as a customer and start booking services.</div>
                        </div>
                        <div className="fg"><label>Full Name</label><input className="fi" placeholder="Enter your full name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                        <div className="fg"><label>Email Address</label><input className="fi" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                        <div className="fg"><label>Phone Number</label><input className="fi" placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                        <input type="hidden" value={form.role} />
                        <div className="fg"><label>Password</label><input type="password" className="fi" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} /></div>
                        <div className="fg"><label>Confirm Password</label><input type="password" className="fi" placeholder="Repeat your password" value={form.confirm} onChange={e => set('confirm', e.target.value)} /></div>
                        <button className="bp" onClick={doReg} disabled={loading}>{loading ? 'Creating account…' : 'Register as Customer →'}</button>
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default AuthModal;
