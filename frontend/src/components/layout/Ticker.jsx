import './Ticker.css';

const ITEMS = ["🌐 Networking","⚡ Electrical","📷 CCTV","❄️ AC & Cooling","🖥️ Hardware","🏠 Appliances","⚙️ Mechanical","🏡 Smart Home"];

const Ticker = () => (
    <div className="ticker-wrap no-print">
        <div className="ticker-inner">
            {[...Array(2)].map((_, r) =>
                ITEMS.map((t, i) => (
                    <span key={r + '-' + i} className="ticker-item">{t}</span>
                ))
            )}
        </div>
    </div>
);

export default Ticker;
