import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pedidoIdsParam = searchParams.get('pedido_ids') || '';
  const sessionId = searchParams.get('session_id') || '';
  const pedidoIds = useMemo(() => pedidoIdsParam.split(',').map((value) => value.trim()).filter(Boolean), [pedidoIdsParam]);

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

        if (sessionId) {
          const verificationResponse = await fetch(`${API_URL}/pagos/verificar-sesion?session_id=${encodeURIComponent(sessionId)}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          const verification = await verificationResponse.json().catch(() => ({}));
          if (!verificationResponse.ok || verification.paid !== true) {
            throw new Error(verification.message || 'El pago todavía no ha sido confirmado por Stripe.');
          }
        }

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
  }, [pedidoIds, sessionId, token]);

  const handleDownloadOfficialInvoice = async () => {
    if (!pedido || !token) return;
    const response = await fetch(`${API_URL}/facturas/pedido/${pedido.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'La factura todavía está siendo generada. Intenta de nuevo en unos segundos.');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wildlife-factura-${pedido.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#244c30_0,_#07100b_42%)] px-6 py-28 text-white md:px-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[#9caf88]/25 bg-[#08140d]/80 p-8 shadow-2xl backdrop-blur-sm md:p-12">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#9caf88]">Payment status</p>
        <div className="mt-6 flex flex-wrap items-center gap-5"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9caf88]/50 bg-[#9caf88]/15 text-3xl text-[#c9d5bd]">✓</span><h1 className="text-4xl font-light md:text-6xl">Payment successful.</h1></div>

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
            <button type="button" onClick={handleDownloadOfficialInvoice} className="mt-6 rounded-lg border border-[#9caf88] bg-[#9caf88] px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:bg-transparent hover:text-[#c9d5bd]">Download invoice PDF</button>
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
