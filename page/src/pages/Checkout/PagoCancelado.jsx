import { Link } from 'react-router-dom';

export function PagoCancelado() {
  return (
    <main className="min-h-screen bg-[#07100b] px-6 py-28 text-white md:px-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-10 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#9caf88]">Payment status</p>
        <h1 className="mt-6 text-4xl font-light md:text-6xl">Payment canceled.</h1>

        <p className="mt-8 text-base leading-8 text-white/60">
          The payment was interrupted or canceled before it was completed. Your cart remains available so you can try again whenever you are ready.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/shop" className="border border-[#9caf88] bg-[#9caf88] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:opacity-90">Return to cart</Link>
          <Link to="/tours" className="border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]">Explore tours</Link>
        </div>
      </div>
    </main>
  );
}
