import './Footer.css';

const Footer = () => (
    <footer className="no-print" style={{ background: '#1e293b', borderTop: '1px solid #334155', padding: '2.5rem', textAlign: 'center', marginTop: '3rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#16a34a', marginBottom: '.5rem' }}>ATNIS</div>
        <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '.88rem' }}>Mallipudi Sai Krishna</p>
        <p style={{ color: '#94a3b8', fontSize: '.78rem', marginTop: '.25rem' }}>Reg No: 2481851062 · SUC No: 2488560013</p>
        <p style={{ color: '#64748b', fontSize: '.7rem', marginTop: '.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Unified Service Solution Portal · Kakinada, Andhra Pradesh
        </p>
    </footer>
);

export default Footer;
