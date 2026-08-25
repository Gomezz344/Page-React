import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const passwordValid =
    form.password.length >= 6;

  const formValid =
    emailValid && passwordValid;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });

    setServerError('');
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (!formValid) return;

    setLoading(true);
    setServerError('');

    try {
      const response = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo iniciar sesión.'
        );
      }

      /*
       * Guardamos el token y los datos del usuario.
       *
       * Si "Recordarme" está activado usamos localStorage.
       * Si no, usamos sessionStorage.
       */

          login(
              data.token,
              data.usuario,
              form.remember
        );

      console.log('Login exitoso:', data);

      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);

      setServerError(
        error.message || 'Error al conectar con el servidor.'
      );
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

          {/* Encabezado */}

          <div className="mb-10 text-center">

            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#9caf88]">
              Welcome back
            </p>

            <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
              Sign in
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              Continue your journey into the wild.
            </p>

          </div>

          {/* Error del backend */}

          {serverError && (
            <div className="mb-6 border border-red-400/20 bg-red-400/5 px-4 py-3 text-center text-xs text-red-300">
              {serverError}
            </div>
          )}

          {/* Formulario */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
              >
                Email address
              </label>

              <div className="relative">

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`w-full border bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 ${
                    touched.email && !emailValid
                      ? 'border-red-400/50 focus:border-red-400'
                      : touched.email && emailValid
                      ? 'border-[#9caf88]/60 focus:border-[#9caf88]'
                      : 'border-white/10 focus:border-[#9caf88]/60'
                  }`}
                />

                {touched.email && emailValid && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9caf88]">
                    ✓
                  </span>
                )}

              </div>

              {touched.email && !emailValid && (
                <p className="mt-2 text-xs text-red-300/80">
                  {form.email.length === 0
                    ? 'El correo electrónico es obligatorio.'
                    : 'Ingresa un correo electrónico válido.'}
                </p>
              )}

            </div>

            {/* PASSWORD */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="block text-[10px] uppercase tracking-[0.25em] text-white/50"
                >
                  Password
                </label>

              </div>

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full border bg-white/[0.03] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 ${
                    touched.password && !passwordValid
                      ? 'border-red-400/50 focus:border-red-400'
                      : touched.password && passwordValid
                      ? 'border-[#9caf88]/60 focus:border-[#9caf88]'
                      : 'border-white/10 focus:border-[#9caf88]/60'
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-white/30 transition hover:text-[#9caf88]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>

              </div>

              {touched.password && !passwordValid && (
                <p className="mt-2 text-xs text-red-300/80">
                  {form.password.length === 0
                    ? 'La contraseña es obligatoria.'
                    : 'La contraseña debe tener al menos 6 caracteres.'}
                </p>
              )}

            </div>

            {/* RECORDAR */}

            <div className="flex items-center justify-between gap-4">

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#9caf88]"
                />

                <span className="text-xs text-white/50">
                  Recordarme
                </span>

              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-white/40 transition hover:text-[#9caf88]"
              >
                ¿Olvidaste tu contraseña?
              </Link>

            </div>

            {/* BOTÓN */}

            <button
              type="submit"
              disabled={!formValid || loading}
              className={`w-full py-3.5 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                formValid && !loading
                  ? 'bg-[#9caf88] text-[#07100b] hover:bg-[#b7c7a5]'
                  : 'cursor-not-allowed bg-white/10 text-white/20'
              }`}
            >
              {loading
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'}
            </button>

          </form>

          {/* REGISTRO */}

          <div className="mt-10 flex items-center gap-4">

            <div className="h-px flex-1 bg-white/10" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
              New here?
            </span>

            <div className="h-px flex-1 bg-white/10" />

          </div>

          <Link
            to="/register"
            className="mt-5 block w-full border border-white/10 py-3.5 text-center text-xs uppercase tracking-[0.25em] text-white/60 transition duration-300 hover:border-[#9caf88]/50 hover:bg-[#9caf88]/5 hover:text-[#b7c7a5]"
          >
            Crear una cuenta
          </Link>

          {/* Nota */}

          <p className="mt-8 text-center text-[10px] leading-6 text-white/20">
            By continuing, you agree to our terms
            and privacy policy.
          </p>

        </div>

      </div>

    </main>
  );
}