import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../../api/axiosInstance';
import TokenSlip from '../ui/TokenSlip';

const sCls = s => ({ waiting: 's-waiting', inprogress: 's-inprogress', confirmed: 's-confirmed', done: 's-done' })[s] || 's-waiting';
const sLbl = s => ({ waiting: '⏳ Waiting — Our team will call you shortly', inprogress: '📞 In Progress — Confirming your booking', confirmed: '✅ Confirmed — Technician assigned', done: '🎉 Completed' })[s] || s;

const TokenFlowModal = ({ isOpen, onClose, mode: initialMode = 'get' }) => {
    const [view, setView] = useState(initialMode);
    const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' });
    const [lookup, setLookup] = useState('');
    const [err, setErr] = useState('');
    const [genTkn, setGenTkn] = useState(null);
    const [lookRes, setLookRes] = useState(null);
    const [loading, setLoading] = useState(false);

    const slipRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: slipRef,
        documentTitle: `ATNIS-Token-${genTkn?.code || 'Slip'}`,
    });

    if (!isOpen) return null;

    const generate = async () => {
        setErr('');
        if (!form.name.trim() || !form.phone.trim()) { setErr('Please enter your name and phone number.'); return; }
        if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) { setErr('Enter a valid 10-digit mobile number.'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/tokens/generate', form);
            setGenTkn(data);
            setView('slip');
        } catch {
            setErr('Failed to generate token. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const doLookup = async () => {
        setErr(''); setLookRes(null);
        if (!lookup.trim()) { setErr('Enter your token number.'); return; }
        setLoading(true);
        try {
            const { data } = await api.get(`/tokens/check/${lookup.trim().toUpperCase()}`);
            setLookRes(data);
        } catch {
            setErr('Token not found. Please check the number and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setView(initialMode); setForm({ name: '', phone: '', address: '', note: '' });
        setLookup(''); setErr(''); setGenTkn(null); setLookRes(null);
        onClose();
    };

    const content = (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="modal" style={{ maxWidth: view === 'slip' ? 420 : 500 }}>
                <button onClick={handleClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>

                {view !== 'slip' && (
                    <div className="auth-tabs" style={{ marginBottom: '1.5rem' }}>
                        <button className={`auth-tab ${view === 'get' ? 'on' : ''}`} style={view === 'get' ? { background: 'var(--accent)', color: '#fff' } : {}} onClick={() => { setView('get'); setErr(''); }}>🎫 Get Token</button>
                        <button className={`auth-tab ${view === 'check' ? 'on' : ''}`} onClick={() => { setView('check'); setErr(''); }}>🔍 Check Status</button>
                    </div>
                )}

                {view === 'get' && (
                    <>
                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '.35rem' }}>🎫 Get a Help Token</h3>
                        <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.4rem' }}>No tech skills needed. Just share your details and our team will call and book for you.</p>
                        {err && <div className="err">⚠ {err}</div>}
                        <div className="fg"><label>Your Full Name *</label><input className="fi" placeholder="e.g. Ramaiah Garu" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div className="fg"><label>Mobile Number *</label><input className="fi" placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                        <div className="fg"><label>Your Area / Address (optional)</label><input className="fi" placeholder="e.g. Suryaraopeta, Kakinada" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                        <div className="fg"><label>What's the problem? (optional)</label><input className="fi" placeholder="e.g. AC not cooling, fan stopped…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
                        <button style={{ width: '100%', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '.92rem', border: 'none', borderRadius: 'var(--radius-md)', padding: '.85rem', cursor: 'pointer', transition: 'all .2s' }} onClick={generate} disabled={loading}>
                            {loading ? 'Generating…' : 'Generate My Token →'}
                        </button>
                    </>
                )}

                {view === 'slip' && genTkn && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>✅ Token Generated!</h3>
                            <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>Our team will call you within 30 minutes.</p>
                        </div>
                        <TokenSlip
                            ref={slipRef}
                            token={genTkn}
                            onPrint={handlePrint}
                            onClose={handleClose}
                        />
                        <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem' }}>
                            <button className="bg" style={{ flex: 1, fontSize: '.8rem' }} onClick={() => { setView('check'); setLookup(genTkn.code || genTkn.tokenCode || ''); }}>🔍 Track Status</button>
                            <button className="bp" style={{ flex: 1, fontSize: '.8rem', marginTop: 0 }} onClick={handleClose}>Done</button>
                        </div>
                    </>
                )}

                {view === 'check' && (
                    <>
                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '.35rem', color: 'var(--text-primary)' }}>🔍 Check Token Status</h3>
                        <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.4rem' }}>Enter your token number to check your service request status.</p>
                        {err && <div className="err">⚠ {err}</div>}
                        <div style={{ display: 'flex', gap: '.65rem', marginBottom: '1.2rem' }}>
                            <input className="fi" placeholder="e.g. TKN-4001" value={lookup} onChange={e => setLookup(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && doLookup()} style={{ flex: 1, letterSpacing: 2, fontWeight: 800, color: 'var(--text-primary)', border: '2px solid var(--accent)', padding: '.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-white)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} />
                            <button style={{ background: 'var(--accent)', color: 'white', fontWeight: 800, fontSize: '.9rem', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 1.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,179,8,.3)', transition: 'all .2s' }} onClick={doLookup} disabled={loading} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                                {loading ? '…' : 'Track Token'}
                            </button>
                        </div>
                        {lookRes && (
                            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', animation: 'fadeUp .3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '.9rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent)', letterSpacing: 2 }}>{lookRes.code || lookRes.tokenCode}</div>
                                        <div style={{ fontSize: '.76rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>{new Date(lookRes.createdAt).toLocaleDateString('en-IN')}</div>
                                    </div>
                                    <span className={`status-pill ${sCls(lookRes.status)}`}>{sLbl(lookRes.status)}</span>
                                </div>
                                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                    <div>👤 {lookRes.name} · 📞 {lookRes.phone}</div>
                                    <div>📍 {lookRes.address}</div>
                                    {lookRes.note && <div>🗒 {lookRes.note}</div>}
                                    {lookRes.assignedServices?.length > 0 && (
                                        <div style={{ marginTop: '.6rem' }}>
                                            <strong style={{ color: 'var(--text-secondary)' }}>Services: </strong>
                                            {lookRes.assignedServices.map((s, i) => <span key={i} className="chip" style={{ marginLeft: '.35rem' }}>{s.name || s}</span>)}
                                        </div>
                                    )}
                                    {lookRes.assignedTechnician && (
                                        <div style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                            <img src={lookRes.assignedTechnician.avatar} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid var(--border)' }} alt="" />
                                            <strong style={{ color: 'var(--text-secondary)' }}>{lookRes.assignedTechnician.name}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default TokenFlowModal;
