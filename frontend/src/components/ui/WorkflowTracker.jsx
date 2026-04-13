import './WorkflowTracker.css';

const WorkflowTracker = ({ step }) => {
    const steps = [
        { num: 1, label: 'Request' },
        { num: 2, label: 'Verify' },
        { num: 3, label: 'Assigned' },
        { num: 4, label: 'Execution' },
        { num: 5, label: 'Complete' }
    ];

    return (
        <div className="workflow-tracker w-full my-6 select-none relative z-10">
            <div className="flex justify-between items-center relative z-20">

                {/* Step Lines Background */}
                <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-[var(--border)] -z-10 rounded-full" />

                {/* Active Line Fill */}
                <div
                    className="absolute top-4 left-[10%] h-1 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500 -z-10"
                    style={{ width: `${Math.min(100, (step - 1) * 20)}%` }}
                />

                {steps.map((s) => {
                    const isActive = step >= s.num;
                    const isCurrent = step === s.num;

                    return (
                        <div key={s.num} className="flex flex-col items-center flex-1 z-20">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 transition-all duration-300 ${isActive
                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm'
                                    : 'bg-[var(--bg-white)] border-[var(--border)] text-[var(--text-muted)]'
                                    } ${isCurrent ? 'animate-pulse scale-110' : ''}`}
                            >
                                {isActive ? '✓' : s.num}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkflowTracker;
