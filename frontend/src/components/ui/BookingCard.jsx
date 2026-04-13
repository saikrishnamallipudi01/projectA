import './BookingCard.css';

const BookingCard = ({ booking, onAdvance, onDelete, isAdmin }) => {
    return (
        <div className="booking-card animate-fadeUp flex flex-col md:flex-row bg-[var(--bg-white)] rounded-xl border border-[var(--border)] overflow-hidden mb-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="md:w-32 bg-[var(--bg-subtle)] flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-[var(--border)] relative">
                <img
                    src={booking.serviceImage || 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=150'}
                    alt={booking.serviceName}
                    className="w-20 h-20 rounded-lg object-cover border border-[var(--border)]"
                />
                {booking.source === 'token' && (
                    <div className="absolute top-2 left-2 bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        🎫 Token
                    </div>
                )}
            </div>

            <div className="p-4 flex-grow flex flex-col justify-between">
                <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-xs text-[var(--text-muted)]">
                            <span>{booking.categoryIcon} {booking.categoryName}</span>
                            <span>·</span>
                            <span className="font-mono">ID: {booking._id.slice(-6).toUpperCase()}</span>
                            <span>·</span>
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{booking.serviceName}</h3>
                        {isAdmin && (
                            <p className="text-sm mt-1 mb-2 text-[var(--text-secondary)]">
                                ServicePoint: <span className="text-[var(--primary)]">{booking.customerName}</span> ({booking.customerPhone})
                            </p>
                        )}
                    </div>

                    <div className="mt-2 md:mt-0 flex flex-col items-end">
                        <span className="text-xl font-bold text-[var(--text-primary)]">₹{booking.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-full mt-2 font-bold ${booking.step === 5 ? 'bg-[var(--primary-light)] text-[var(--primary)]' :
                                booking.step === 1 ? 'bg-gray-100 text-gray-600' :
                                    'bg-blue-50 text-blue-600'
                            }`}>
                            {booking.step === 5 ? '✅ Complete' : booking.step === 1 ? '⏳ Pending' : '🔵 In Progress'}
                        </span>
                    </div>
                </div>

                {booking.technicianId && (
                    <div className="flex items-center gap-2 mt-4 bg-[var(--bg-subtle)] p-2 rounded-lg border border-[var(--border)] w-fit">
                        <img
                            src={booking.technicianId.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=50'}
                            className="w-8 h-8 rounded-full border border-[var(--border)]"
                            alt="Tech"
                        />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-[var(--text-primary)]">{booking.technicianId.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Assigned Technician</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[var(--bg-subtle)] border-t md:border-t-0 md:border-l border-[var(--border)] p-4 flex flex-row md:flex-col justify-center gap-3">
                {booking.step < 5 && (
                    <button
                        onClick={() => onAdvance(booking._id)}
                        className="flex-1 bp py-2 px-4 shadow-sm text-sm"
                        style={{ marginTop: 0 }}
                    >
                        Advance Step →
                    </button>
                )}
                {(isAdmin || booking.step === 1) && (
                    <button
                        onClick={() => onDelete(booking._id)}
                        className="flex-1 bg-transparent text-[var(--danger)] border border-[var(--danger)] py-2 px-4 rounded-lg hover:bg-[var(--danger-border)] transition-colors font-bold text-sm"
                    >
                        Cancel Order
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookingCard;
