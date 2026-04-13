import { resolveImagePath } from '../../utils/imagePath';

const ServiceDetailCard = ({ service, onBook, isBooked, onCancel, onShowTechs, isLoggedIn = true }) => {
    return (
        <div className="svc-detail-card fu">
            <div className="sdc-img-wrap" style={{ height: 170 }}>
                <img
                    src={resolveImagePath(service.image)}
                    alt={service.name}
                    className="sdc-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onError={e => { e.target.parentElement.style.background = 'var(--bg-subtle)'; e.target.style.display = 'none'; }}
                />
                <div className="sdc-img-overlay" />
                <div className="sdc-badge">⏱ {service.estimatedTime}</div>
                <div className="sdc-price-tag">₹ {service.price?.toLocaleString('en-IN')}</div>
            </div>
            <div className="sdc-body">
                <h3 className="sdc-title">{service.name}</h3>
                <p className="sdc-desc">{service.description}</p>

                <div className="sdc-meta">
                    <span className="sdc-meta-item">⏱ {service.estimatedTime}</span>
                    <span className="sdc-meta-item">📍 At your location</span>
                    <span className="sdc-meta-item">✅ Guaranteed</span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: '.5rem' }}>WHAT'S INCLUDED</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                        {(service.includes && service.includes.length > 0
                            ? service.includes
                            : ['Professional Inspection', 'Expert Service', 'Quality Assurance', 'Post-Service Support']
                        ).slice(0, 4).map((inc, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--primary)', fontSize: '.9rem' }}>✓</span> {inc}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sdc-actions">
                    {isBooked ? (
                        <>
                            <div className="btn-booked">✔ Booked</div>
                            {onCancel && <button className="btn-cancel-svc" onClick={onCancel}>Cancel</button>}
                        </>
                    ) : (
                        <button
                            className="btn-book-main"
                            onClick={() => onBook(service)}
                            style={!isLoggedIn ? { background: 'var(--text-secondary)' } : {}}
                        >
                            {isLoggedIn ? 'Book This Service' : '🔒 Login to Book'}
                        </button>
                    )}
                    {onShowTechs && (
                        <button className="btn-see-techs" onClick={onShowTechs}>👷</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailCard;

