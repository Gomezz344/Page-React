import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../api/client';

export function ForgotPassword() {
  const initialToken = new URLSearchParams(window.location.search).get('token') || '';
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(Boolean(initialToken));
  const [resetToken, setResetToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [initialToken]);

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched(true);

    if (!emailValid) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not start account recovery.');
      setResetToken(data.reset_token || '');
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6 || password !== confirmPassword) {
      setError(password.length < 6 ? 'Password must be at least 6 characters.' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not update the password.');
      setResetToken('');
      setPassword('');
      setConfirmPassword('');
      setSent(false);
      setEmail('');
      setTouched(false);
      window.alert('Password updated successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07100b] text-white">

      {/* Fondo */}

      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(156,175,136,0.12),transparent_45%)]" />

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#9caf88]/5 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#9caf88]/5 blur-3xl" />

      </div>


      {/* Contenido */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32">

        <div className="w-full max-w-md">

          {error && <div className="mb-6 border border-red-400/20 bg-red-400/5 px-4 py-3 text-center text-xs text-red-300">{error}</div>}

          {!sent ? (

            <>
              {/* Encabezado */}

              <div className="mb-10 text-center">

                <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#9caf88]">
                  Account recovery
                </p>

                <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
                  Forgot password?
                </h1>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/40">
                  Enter your email address and we'll
                  help you get back into your account.
                </p>

              </div>


              {/* Formulario */}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                  >
                    Email address
                  </label>


                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSent(false);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="you@example.com"
                    className={`w-full border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 ${
                      touched && !emailValid
                        ? 'border-red-400/50 focus:border-red-400'
                        : touched && emailValid
                        ? 'border-[#9caf88]/60 focus:border-[#9caf88]'
                        : 'border-white/10 focus:border-[#9caf88]/60'
                    }`}
                  />


                  {touched && !emailValid && (

                    <p className="mt-2 text-xs text-red-300/80">
                      {email.length === 0
                        ? 'Email address is required.'
                        : 'Enter a valid email address.'}
                    </p>

                  )}

                </div>


                {/* Botón */}

                <button
                  type="submit"
                  disabled={!emailValid || loading}
                  className={`w-full py-3.5 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                    emailValid && !loading
                      ? 'bg-[#9caf88] text-[#07100b] hover:bg-[#b7c7a5]'
                      : 'cursor-not-allowed bg-white/10 text-white/20'
                  }`}
                >
                  {loading ? 'Sending...' : 'Send recovery link'}
                </button>

              </form>


              {/* Volver al login */}

              <div className="mt-8 text-center">

                <Link
                  to="/login"
                  className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[#9caf88]"
                >
                  ← Back to sign in
                </Link>

              </div>

            </>

          ) : (

            /* =========================
               MENSAJE DE CONFIRMACIÓN
            ========================== */

            <div className="text-center">

              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#9caf88]/30 bg-[#9caf88]/5">

                <span className="text-2xl text-[#9caf88]">
                  ✓
                </span>

              </div>


              <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#9caf88]">Recovery ready</p>


              <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
                Set a new password
              </h1>


              <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-white/40">

                In development mode, the recovery link is ready for

                <span className="mx-1 text-white/70">
                  {email}
                </span>

                your account. Choose a new password below.

              </p>


              <form onSubmit={handleReset} className="mt-8 space-y-4 text-left">
                <div>
                  <label htmlFor="reset-token" className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50">
                    Recovery token
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="reset-token"
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="The token will appear here"
                      className="min-w-0 flex-1 border border-[#9caf88]/40 bg-white/[0.03] px-4 py-3 text-xs text-[#c9d5bd] outline-none focus:border-[#9caf88]"
                    />
                    <button
                      type="button"
                      disabled={!resetToken}
                      onClick={() => navigator.clipboard?.writeText(resetToken)}
                      className="border border-white/10 px-3 text-[9px] uppercase tracking-wider text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88] disabled:cursor-not-allowed disabled:text-white/20"
                    >
                      Copiar
                    </button>
                  </div>
                  {!resetToken && <p className="mt-2 text-xs text-amber-200/70">No token was generated for this email.</p>}
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-[#9caf88]/60" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-[#9caf88]/60" />
                <button type="submit" disabled={loading || !resetToken} className="w-full bg-[#9caf88] py-3.5 text-xs uppercase tracking-[0.25em] text-[#07100b] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/20">{loading ? 'Updating...' : 'Update password'}</button>
              </form>

              <Link to="/login" className="mt-6 inline-flex text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[#9caf88]">Back to sign in</Link>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
