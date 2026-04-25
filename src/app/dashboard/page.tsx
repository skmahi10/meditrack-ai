export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#12253a_0%,#09111b_42%,#05080d_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-slate-950/60 p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">MediTrack AI</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard route ready</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          This route now lives under <code>src/app/dashboard</code> so the project uses a
          single App Router tree.
        </p>
      </div>
    </main>
  );
}
