import React, { forwardRef } from 'react';
import './TokenSlip.css';

const TokenSlip = forwardRef(({ token, onPrint, onClose, hideActions = false }, ref) => {
    if (!token) return null;

    const dateStr = token?.createdAt
        ? new Date(token.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' }) +
          ' · ' +
          new Date(token.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '---';

    return (
        <div ref={ref} className="token-slip-container">
            {/* Outer slip — dark gold-border card matching screenshot */}
            <div className="token-slip-card">
                {/* Header label */}
                <div className="tkn-brand-label">ATNIS SERVICE TOKEN</div>

                {/* Icon box */}
                <div className="tkn-icon-box">
                    <span style={{ fontSize: '2rem' }}>🎫</span>
                </div>

                {/* Token number */}
                <div className="tkn-code-display">
                    {token?.code || token?.tokenCode || 'TKN-0000'}
                </div>

                {/* Divider */}
                <div className="tkn-divider" />

                {/* Details */}
                <div className="tkn-details">
                    {token?.name     && <div className="tkn-row"><span>👤</span><span>{token.name}</span></div>}
                    {token?.phone    && <div className="tkn-row"><span>📞</span><span>{token.phone}</span></div>}
                    {token?.address  && <div className="tkn-row"><span>📍</span><span>{token.address}</span></div>}
                    {token?.note     && <div className="tkn-row"><span>🗒</span><span>{token.note}</span></div>}
                                        <div className="tkn-row"><span>📅</span><span>{dateStr}</span></div>
                </div>

                {/* Footer */}
                <div className="tkn-footer">Our team will call you to confirm your service</div>

                {/* Action buttons — hidden on print */}
                {!hideActions && (
                    <div className="tkn-actions no-print">
                        <button onClick={onPrint} className="tkn-btn-print">🖨 Print Slip</button>
                        <button onClick={onClose} className="tkn-btn-done">Got It ✓</button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default TokenSlip;
