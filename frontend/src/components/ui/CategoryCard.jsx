import { useNavigate } from 'react-router-dom';

import { resolveImagePath } from '../../utils/imagePath';

const CategoryCard = ({ category, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(`/services/${category.id || category._id}`);
    };

    return (
        <div
            className="cat-card"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClick()}
        >
            {/* ✅ NEW WRAPPER ADDED (only change) */}
            <div className="cat-img-wrapper">
                <img
                    src={resolveImagePath(category.image)}
                    alt={category.name}
                    className="cat-img"
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                />
            </div>

            <div className="cat-body">
                <div style={{ fontSize: '1.2rem', marginBottom: '.28rem' }}>{category.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '.18rem', color: 'var(--text-primary)' }}>
                    {category.name}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '.1rem' }}>
                    {category.serviceCount != null ? `${category.serviceCount} services` : '6 services'}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {category.tagline ? category.tagline.split(' ').slice(0, 6).join(' ') + '…' : ''}
                </div>
                <div className="cat-arrow">→</div>
            </div>
        </div>
    );
};

export default CategoryCard;