import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched(true);

    if (!emailValid) return;

    // Por ahora solo visual
    setSent(true);
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
                        ? 'El correo electrónico es obligatorio.'
                        : 'Ingresa un correo electrónico válido.'}
                    </p>

                  )}

                </div>


                {/* Botón */}

                <button
                  type="submit"
                  disabled={!emailValid}
                  className={`w-full py-3.5 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                    emailValid
                      ? 'bg-[#9caf88] text-[#07100b] hover:bg-[#b7c7a5]'
                      : 'cursor-not-allowed bg-white/10 text-white/20'
                  }`}
                >
                  Send recovery link
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


              <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#9caf88]">
                Check your inbox
              </p>


              <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
                Email sent
              </h1>


              <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-white/40">

                If an account exists for

                <span className="mx-1 text-white/70">
                  {email}
                </span>

                you'll receive instructions to reset
                your password.

              </p>


              <Link
                to="/login"
                className="mt-10 inline-flex border border-white/10 px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-white/60 transition duration-300 hover:border-[#9caf88]/50 hover:bg-[#9caf88]/5 hover:text-[#b7c7a5]"
              >
                Back to sign in
              </Link>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}