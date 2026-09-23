import { useState } from 'react';
import { API_URL } from '../../api/client';

const initialMessage = {
  role: 'assistant',
  content: 'Hola, soy el asistente de Wildlife. Puedo ayudarte con productos, tours, compras, reservas y PQR.',
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || loading) return;

    const history = messages.slice(-12);
    setMessages((current) => [...current, { role: 'user', content }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No fue posible contactar al asistente.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section className="fixed bottom-24 right-5 z-[60] flex h-[min(560px,calc(100vh-120px))] w-[min(380px,calc(100vw-40px))] flex-col border border-white/10 bg-[#08140d] shadow-2xl">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#9caf88]">Wildlife assistant</p>
              <p className="mt-1 text-sm text-white/70">Atención inicial</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-xl text-white/40 hover:text-white" aria-label="Cerrar chatbot">×</button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`max-w-[88%] px-3 py-2 text-sm leading-6 ${item.role === 'user' ? 'ml-auto bg-[#9caf88] text-[#07100b]' : 'bg-white/[0.06] text-white/75'}`}>
                {item.content}
              </div>
            ))}
            {loading && <div className="max-w-[88%] bg-white/[0.06] px-3 py-2 text-sm text-white/40">Escribiendo…</div>}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-3">
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe tu pregunta…" maxLength={2000} className="min-w-0 flex-1 border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#9caf88]/60" />
            <button type="submit" disabled={loading || !message.trim()} className="border border-[#9caf88] px-3 text-[10px] uppercase tracking-wider text-[#9caf88] disabled:cursor-not-allowed disabled:opacity-30">Enviar</button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} className="fixed bottom-40 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#9caf88] text-xl text-[#07100b] shadow-xl transition hover:scale-105" aria-label="Abrir asistente">✦</button>
    </>
  );
}
