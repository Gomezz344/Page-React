import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pedidoIds = (searchParams.get('pedido_ids') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      if (!token) {
        if (!cancelled) {
          setPedido(null);
          setError('Inicia sesión para ver el detalle de tu pedido.');
          setLoading(false);
        }
        return;
      }

      if (pedidoIds.length === 0) {
        if (!cancelled) {
          setPedido(null);
          setError('No se encontró el identificador del pedido.');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/pedidos/${pedidoIds[0]}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo consultar el pedido');
        }

        if (!cancelled) {
          setPedido(data);
        }
      } catch (requestError) {
        console.error('Error loading order:', requestError);
        if (!cancelled) {
          setError(requestError.message || 'No se pudo cargar el pedido.');
          setPedido(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [pedidoIds, token]);

  const handleDownloadInvoice = () => {
    const invoiceText = `Wildlife - Order Receipt\n\nOrder ID: ${pedido?.id || '#'}\nStatus: ${pedido?.estado || 'pagado'}\nAmount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pedido?.monto_total || 0)}\n\nThank you for your purchase.`;

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wildlife-order-${pedido?.id || 'receipt'}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#07100b] px-6 py-28 text-white md:px-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#9caf88]/25 bg-white/[0.02] p-10 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#9caf88]">Payment status</p>
        <h1 className="mt-6 text-4xl font-light md:text-6xl">Payment successful.</h1>

        <p className="mt-8 text-base leading-8 text-white/60">
          Your reservation has been processed successfully. Check the details below and continue exploring the wildlife experiences.
        </p>

        {loading && <p className="mt-8 text-sm text-white/40">Checking your order...</p>}

        {error && !loading && (
          <div className="mt-8 border border-red-500/30 bg-red-500/5 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-[#9caf88]/20 bg-[#08140d] p-6">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#9caf88]">Payment completed</p>
          <p className="mt-4 text-base leading-8 text-white/65">
            Your payment has been successfully processed. You can continue browsing, and the order is now available in your account.
          </p>
        </div>

        {pedido && (
          <div className="mt-10 border border-white/10 bg-[#08140d] p-6">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Order summary</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:justify-between">
              <span>Order ID</span>
              <strong className="text-[#c9d5bd]">#{pedido.id}</strong>
            </div>
            <div className="mt-3 flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:justify-between">
              <span>Status</span>
              <strong className="text-[#c9d5bd]">{pedido.estado}</strong>
            </div>
            <div className="mt-3 flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:justify-between">
              <span>Amount</span>
              <strong className="text-[#c9d5bd]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pedido.monto_total || 0)}</strong>
            </div>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="mt-6 border border-[#9caf88] bg-[#9caf88] px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:opacity-90"
            >
              Download payment receipt
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/shop" className="border border-[#9caf88] bg-[#9caf88] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:opacity-90">Back to shop</Link>
          <Link to="/profile" className="border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]">My profile</Link>
        </div>
      </div>
    </main>
  );
}
