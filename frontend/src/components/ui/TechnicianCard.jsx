const TechnicianCard = ({ technician, idx = 0, showPhone = true }) => {
    return (
        <div className="tech-card fu" style={{ animationDelay: idx * .06 + 's' }}>
            <img
                src={technician.avatar || `https://i.pravatar.cc/150?img=${10 + idx}`}
                alt={technician.name}
                className="tech-av"
                onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${technician._id}`; }}
            />
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)' }}>{technician.name}</div>
                        <div style={{ fontSize: '.76rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '.3rem' }}>{technician.role}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.28rem', fontSize: '.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                        ⭐ {technician.rating?.toFixed(1) || '4.9'} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({technician.reviews || technician.completedJobs || 0})</span>
                    </div>
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    📍 {technician.location} · <span className="dist-chip">🚗 {technician.distanceKm || technician.dist || 0} km</span><br />
                    {showPhone
                        ? <>📞 {technician.phone} · 🧰 {technician.experience || technician.exp}</>
                        : <span style={{ filter: 'blur(3.5px)', userSelect: 'none', opacity: 0.6 }}>📞 ••••••••••&nbsp;· 🧰 {technician.experience || technician.exp}</span>
                    }
                    {technician.bio && <><br /><span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{technician.bio}</span></>}
                </div>
                <div style={{ display: 'flex', gap: '.32rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
                    <span style={{
                        fontSize: '.68rem', fontWeight: 600, padding: '.2rem .58rem', borderRadius: 999,
                        background: technician.status === 'available' ? 'var(--primary-light)' : 'var(--accent-light)',
                        color: technician.status === 'available' ? 'var(--primary)' : 'var(--accent)',
                        border: `1px solid ${technician.status === 'available' ? 'var(--primary-border)' : 'var(--accent-border)'}`
                    }}>
                        {technician.status === 'available' ? '✔ Available' : '⏳ Busy'}
                    </span>
                    {(technician.certifications || technician.certs || []).map(c => (
                        <span key={c} style={{ fontSize: '.68rem', fontWeight: 600, padding: '.2rem .58rem', borderRadius: 999, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>🎓 {c}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TechnicianCard;
