import './StatsBar.css';

const StatsBar = () => {
    return (
        <div className="stats-bar-wrapper animate-fadeUp">
            <div className="container stats-container">
                <div className="stat-item">
                    <span className="stat-value">48+</span>
                    <span className="stat-label">Services</span>
                </div>
                <div className="stat-divider">·</div>
                <div className="stat-item">
                    <span className="stat-value">10</span>
                    <span className="stat-label">Technicians</span>
                </div>
                <div className="stat-divider">·</div>
                <div className="stat-item">
                    <span className="stat-value">500+</span>
                    <span className="stat-label">Jobs Done</span>
                </div>
                <div className="stat-divider">·</div>
                <div className="stat-item">
                    <span className="stat-value text-gold">4.8★</span>
                    <span className="stat-label">Avg Rating</span>
                </div>
                <div className="stat-divider hidden-mobile">·</div>
                <div className="stat-item hidden-mobile">
                    <span className="stat-value">Kakinada</span>
                    <span className="stat-label">Coverage Area</span>
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
