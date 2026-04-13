import React, { forwardRef } from 'react';
import './TokenSlip.css'; // Reusing some slip styles

const BookingSlip = forwardRef(({ booking, onPrint, onClose, hideActions = false }, ref) => {
    if (!booking) return null;

    return (
        <div ref={ref} className="token-slip-container">
            <div className="token-slip max-w-sm mx-auto w-full relative" style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                {/* Decorative Slip Header */}
                <div className="bg-[var(--bg-subtle)] rounded-t-xl overflow-hidden relative border-b border-[var(--border)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary-light)]"></div>
                    <div className="text-center py-6 px-4 relative">
                        <div className="absolute inset-0 opacity-80" />
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[var(--primary)] text-4xl mb-2">📄</span>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-widest uppercase shadow-sm">Booking Receipt</h2>
                            <p className="text-sm text-[var(--text-muted)]">ATNIS Unified Service Solution</p>
                        </div>
                    </div>
                </div>

                {/* Slip Body */}
                <div className="bg-[var(--bg-white)] px-8 pt-6 pb-10 border-x border-[var(--border)] relative isolate">
                    
                    {/* ID Highlight */}
                    <div className="text-center mb-6 relative">
                        <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Booking ID</span>
                        <div className="font-mono text-xl font-bold text-[var(--primary)] tracking-wider">
                            #{booking._id?.slice(-8).toUpperCase()}
                        </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-2">
                            <span className="text-xs text-[var(--text-muted)]">Service</span>
                            <span className="font-bold text-[var(--text-primary)] text-right max-w-[60%]">{booking.serviceName}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-2">
                            <span className="text-xs text-[var(--text-muted)]">Customer</span>
                            <span className="font-bold text-[var(--text-primary)] text-right max-w-[60%]">{booking.customerName}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-2">
                            <span className="text-xs text-[var(--text-muted)]">Phone</span>
                            <span className="font-bold text-[var(--text-primary)] text-right max-w-[60%]">{booking.customerPhone}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-2">
                            <span className="text-xs text-[var(--text-muted)]">Technician</span>
                            <span className="font-bold text-[var(--text-secondary)] text-right max-w-[60%]">
                                {booking.technicianId?.name || 'Pending Assignment'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-2">
                            <span className="text-xs text-[var(--text-muted)]">Scheduled</span>
                            <span className="font-bold text-[var(--text-primary)] text-right max-w-[60%]">{booking.slot || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-2">
                            <span className="text-xs text-[var(--text-muted)]">Price</span>
                            <span className="font-bold text-[var(--primary)] text-right max-w-[60%]">₹{booking.price}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-[var(--text-muted)]">Status</span>
                            <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                booking.step === 5 ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 
                                booking.step === 1 ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {booking.step === 5 ? 'COMPLETED' : booking.step === 1 ? 'PENDING' : 'IN PROGRESS'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[var(--bg-subtle)] rounded-b-xl border-x border-b border-[var(--border)] px-6 pb-6 pt-2 text-center relative overflow-hidden">
                    <div className="w-full h-[40px] opacity-10 mb-4" />
                    
                    <p className="text-[10px] text-[var(--text-muted)] mb-6 px-4 italic">
                        This is a digital booking confirmation. Please show this at the time of service.
                    </p>

                    {!hideActions && (
                        <div className="flex gap-3 justify-center no-print">
                            <button onClick={onPrint} className="bg" style={{ flex: 1, color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                🖨 Print Receipt
                            </button>
                            <button onClick={onClose} className="bp" style={{ flex: 1, marginTop: 0 }}>
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default BookingSlip;
