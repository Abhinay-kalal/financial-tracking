export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fintrix-style geometric accent */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top-right navy panel */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'rgb(14,28,41)' }}
        />
        {/* Purple accent orb */}
        <div
          className="absolute top-1/3 -left-24 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: 'rgb(83,37,154)' }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(rgb(14,28,41) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] h-[540px] mr-12 p-10 rounded-2xl relative overflow-hidden flex-shrink-0"
        style={{ background: 'rgb(14,28,41)' }}>
        {/* Top */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl fintrix-gradient-bg flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-8-6h16" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-[15px] font-['Instrument_Sans',sans-serif]">Finance Copilot</p>
              <p className="text-white/40 text-[11px]">GST Invoicing & Analytics</p>
            </div>
          </div>
          <h2 className="text-white text-[26px] font-bold font-['Instrument_Sans',sans-serif] leading-tight tracking-tight mb-3">
            Smarter finance.<br />Faster growth.
          </h2>
          <p className="text-white/50 text-[13.5px] leading-relaxed">
            End-to-end financial management — invoicing, GST, expense tracking, and real-time analytics in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Active Users', value: '12,400+' },
            { label: 'Invoices Sent', value: '₹2.4Cr+' },
            { label: 'GST Filings', value: '98%' },
            { label: 'Uptime', value: '99.9%' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white text-[17px] font-bold font-['Instrument_Sans',sans-serif]">{s.value}</p>
              <p className="text-white/40 text-[11px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth card */}
      <div className="relative w-full max-w-[400px]">
        {children}
      </div>
    </div>
  );
}
