import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './InvoicePage.css';

const InvoicePage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `ATNIS-Invoice-${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}`,
    });

    const fetchInvoices = () => {
        const params = new URLSearchParams(window.location.search);
        const tokenCode = params.get('token');
        const stateBookingId = location.state?.bookingId;

        if (tokenCode) {
            api.get(`/invoices/guest/${tokenCode}`)
                .then(r => setBookings(r.data.filter(b => b.isInvoiceGenerated)))
                .catch(() => toast.error('Failed to load guest invoice'))
                .finally(() => setLoading(false));
        } else if (stateBookingId) {
            const endpoint = user?.role === 'Admin' || user?.role === 'ServicePoint'
                ? '/bookings'
                : '/bookings/my';
            api.get(endpoint).then(r => {
                const specific = r.data.find(b => b._id === stateBookingId);
                if (specific && specific.isInvoiceGenerated) {
                    setBookings([specific]);
                } else if (specific) {
                    // Show even if invoice not yet generated (for admins)
                    setBookings([specific]);
                } else {
                    setBookings(r.data.filter(b => b.isInvoiceGenerated));
                }
            }).catch(() => toast.error('Failed to load invoice')).finally(() => setLoading(false));
        } else if (user) {
            const endpoint = user?.role === 'Admin' || user?.role === 'ServicePoint'
                ? '/bookings'
                : '/bookings/my';
            api.get(endpoint)
                .then(r => setBookings(r.data.filter(b => b.isInvoiceGenerated)))
                .catch(() => toast.error('Failed to load'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, [user, location.state]);

    if (loading) return <div className="empty" style={{ paddingTop: '6rem' }}><span className="ei">⏳</span><p>Loading Invoice...</p></div>;

    return (
        <div className="main">
            <div className="sec-tag no-print">Billing</div>
            <h2 className="sec-title no-print">Invoice</h2>
            <p className="sec-sub no-print">Auto-generated for all booked services</p>

            {/* Action buttons above invoice */}
            {bookings.length > 0 && (
                <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={handlePrint}
                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', padding: '.7rem 1.8rem', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}
                    >
                        🖨 Print Invoice
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{ background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '.7rem 1.8rem', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}
                    >
                        📥 Download PDF
                    </button>
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="empty"><span className="ei">🧾</span><p>No completed invoices found.</p></div>
            ) : (
                /* Printable invoice area */
                <div ref={invoiceRef} className="inv-page-wrap">
                    {/* Print header */}
                    <div className="inv-print-header">
                        <span>{new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span>ATNIS – Unified Service Portal</span>
                        <span></span>
                    </div>

                    <div className="invoice">
                        {/* Invoice top section */}
                        <div className="inv-top">
                            <div>
                                <h1 className="inv-heading">INVOICE</h1>
                                <p className="inv-meta">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                {bookings[0]?.invoiceNumber && (
                                    <p className="inv-meta" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Ref: {bookings[0].invoiceNumber}</p>
                                )}
                                <p className="inv-meta">Bill To: <strong>{bookings[0]?.customerName || user?.name || '—'}</strong></p>
                                <p className="inv-meta">Phone: {bookings[0]?.customerPhone || user?.phone || '—'}</p>
                                {bookings[0]?.source === 'token' && bookings[0]?.tokenCode && (
                                    <p className="inv-meta" style={{ color: 'var(--accent)', fontWeight: 600 }}>🎫 Token Ref: {bookings[0].tokenCode}</p>
                                )}
                                {bookings[0]?.riseLocation && (
                                    <p className="inv-meta" style={{ color: 'var(--text-secondary)' }}>Origin: {bookings[0].riseLocation}</p>
                                )}
                            </div>
                            <div className="inv-company">
                                <div className="inv-company-name">ATNIS Technical Solutions</div>
                                <div>Aditya Degree &amp; PG College, Kakinada</div>
                                <div>Andhra Pradesh – 533 003</div>
                                <div>GST: 37AABCA1234Z1ZK · Ph: +91 98765 43200</div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="inv-tbl">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Service</th>
                                    <th>Category</th>
                                    <th>Technician</th>
                                    <th>Source</th>
                                    <th style={{ textAlign: 'right' }}>₹ Amount</th>
                                    <th className="no-print" style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b, i) => (
                                    <tr key={b._id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{b.serviceName || '—'}</div>
                                            {b.slot && <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>⏰ {b.slot}</div>}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{b.categoryIcon} {b.categoryName}</td>
                                        <td style={{ fontSize: '.82rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.technicianId?.name || '—'}</div>
                                            {b.technicianId?.phone && <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>📞 {b.technicianId.phone}</div>}
                                        </td>
                                        <td>
                                            {b.source === 'token'
                                                ? <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '.7rem', padding: '.2rem .55rem', borderRadius: 4, fontWeight: 700 }}>🎫 Token</span>
                                                : <span style={{ color: 'var(--primary)', fontSize: '.78rem', fontWeight: 600 }}>Self</span>}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                            {b.originalPrice && b.originalPrice !== b.price && (
                                                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{b.originalPrice.toLocaleString('en-IN')}</div>
                                            )}
                                            {b.price?.toLocaleString('en-IN') || '—'}
                                            {b.discountAmount > 0 && (
                                                <div style={{ fontSize: '.65rem', color: 'var(--primary)' }}>−₹{b.discountAmount}</div>
                                            )}
                                        </td>
                                        <td className="no-print" style={{ textAlign: 'center' }}>
                                            {(user?.role === 'Admin' || user?.role === 'ServicePoint') && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm('Remove this item?')) return;
                                                        try { await api.delete(`/bookings/${b._id}/invoice`); toast.success('Removed'); fetchInvoices(); }
                                                        catch { toast.error('Failed to remove'); }
                                                    }}
                                                    style={{ padding: '.3rem .6rem', background: 'var(--danger-light)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 5, cursor: 'pointer', fontSize: '.72rem' }}
                                                >🗑</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={5} style={{ padding: '1rem 1rem', fontWeight: 700, fontSize: '.95rem', borderTop: '2px solid var(--border)', color: 'var(--text-primary)' }}>
                                        Total Payable
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.28rem', color: 'var(--text-primary)', padding: '1rem', borderTop: '2px solid var(--border)' }}>
                                        ₹ {bookings.reduce((s, b) => s + (b.price || 0), 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="no-print" style={{ borderTop: '2px solid var(--border)' }} />
                                </tr>
                            </tfoot>
                        </table>

                        {/* Work description & technician  */}
                        {(bookings[0]?.workDescription || bookings[0]?.technicianId) && (
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem', padding: '1.2rem', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                {bookings[0]?.workDescription && (
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.4rem' }}>Work Description</div>
                                        <div style={{ fontSize: '.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{bookings[0].workDescription}</div>
                                    </div>
                                )}
                                {bookings[0]?.technicianId && (
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.6rem' }}>Technician In-Charge</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                            <img src={bookings[0].technicianId?.avatar || 'https://i.pravatar.cc/100?u=tech'} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--border)' }} alt="" />
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '.9rem' }}>{bookings[0].technicianId.name}</div>
                                                <div style={{ fontSize: '.74rem', color: 'var(--text-secondary)' }}>📞 {bookings[0].technicianId.phone || '+91 99999 00000'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="inv-footer-line">
                            Reg No: 2481851062 | SUC No: 2488560013
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicePage;
