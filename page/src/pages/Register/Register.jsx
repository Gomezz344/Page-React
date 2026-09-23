import { useState } from 'react';
import { API_URL } from '../../api/client';
import { Link } from 'react-router-dom';
import Input from '../../components/Input/Input';

export function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    documentType: '',
    documentNumber: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validations = {
    firstName: /^.{1,20}$/.test(form.firstName.trim()),

    lastName: /^.{1,20}$/.test(form.lastName.trim()),

    documentType: form.documentType !== '',

    documentNumber: /^\d{1,10}$/.test(form.documentNumber),

    address: form.address.trim().length >= 5,

    phone: /^\d{1,10}$/.test(form.phone),

    email: form.email.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),

    password: form.password.length >= 6,

    confirmPassword:
      form.confirmPassword.length > 0 &&
      form.confirmPassword === form.password,
  };

  const formValid = Object.values(validations).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = ['documentNumber', 'phone'].includes(name)
      ? value.replace(/\D/g, '').slice(0, 10)
      : value;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: nextValue,
    }));

    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    setRegistered(false);
    setServerMessage('');
  };

  const handleBlur = (field) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};

    Object.keys(validations).forEach((field) => {
      allTouched[field] = true;
    });

    setTouched(allTouched);

    if (!formValid) return;

    setLoading(true);
    setServerMessage('');

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: form.firstName,
            apellido: form.lastName,
            tipo_documento: form.documentType,
            numero_documento: form.documentNumber,
            direccion: form.address,
            telefono: form.phone,
            correo: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setServerMessage(
          data.message || 'Could not create the account.'
        );
        return;
      }

      setRegistered(true);
    } catch (error) {
      console.error('Connection error:', error);

      setServerMessage(
        'Could not connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (field) => {
    if (!touched[field]) {
      return 'border-white/10 focus:border-[#9caf88]/60';
    }

    if (!validations[field]) {
      return 'border-red-400/50 focus:border-red-400';
    }

    return 'border-[#9caf88]/60 focus:border-[#9caf88]';
  };

  const inputProps = {
    form,
    handleChange,
    handleBlur,
    touched,
    validations,
    getInputClasses,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07100b] text-white">

      {/* =========================
          FONDO
      ========================== */}

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(156,175,136,0.12),transparent_45%)]" />

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#9caf88]/5 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#9caf88]/5 blur-3xl" />
      </div>

      {/* =========================
          CONTENIDO
      ========================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32">
        <div className="w-full max-w-2xl">

          {!registered ? (
            <>

              {/* =========================
                  HEADER
              ========================== */}

              <div className="mb-12 text-center">

                <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#9caf88]">
                  Join the journey
                </p>

                <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
                  Create account
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/40">
                  Create your account and start
                  exploring the wild.
                </p>

              </div>

              {/* =========================
                  FORMULARIO
              ========================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-8"
              >

                {/* =========================
                    INFORMACIÓN PERSONAL
                ========================== */}

                <div>

                  <div className="mb-6 flex items-center gap-4">

                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#9caf88]">
                      01
                    </span>

                    <span className="h-px flex-1 bg-white/10" />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Personal information
                    </span>

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    <Input
                      {...inputProps}
                      name="firstName"
                      label="First name"
                      placeholder="Your first name"
                      maxLength={20}
                    />

                    <Input
                      {...inputProps}
                      name="lastName"
                      label="Last name"
                      placeholder="Your last name"
                      maxLength={20}
                    />

                  </div>

                </div>

                {/* =========================
                    DOCUMENTO
                ========================== */}

                <div>

                  <div className="mb-6 flex items-center gap-4">

                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#9caf88]">
                      02
                    </span>

                    <span className="h-px flex-1 bg-white/10" />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Identification
                    </span>

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* Tipo de documento */}

                    <div>

                      <label
                        htmlFor="documentType"
                        className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                      >
                        Document type
                      </label>

                      <select
                        id="documentType"
                        name="documentType"
                        value={form.documentType}
                        onChange={handleChange}
                        onBlur={() =>
                          handleBlur('documentType')
                        }
                        className={`w-full border bg-[#0b160f] px-4 py-3 text-sm outline-none transition ${getInputClasses(
                          'documentType'
                        )}`}
                      >

                        <option value="">
                          Select an option
                        </option>

                        <option value="CC">
                          National ID
                        </option>

                        <option value="CE">
                          Foreign ID
                        </option>

                        <option value="TI">
                          Identity card
                        </option>

                        <option value="PASSPORT">
                          Pasaporte
                        </option>

                      </select>

                      {touched.documentType &&
                        !validations.documentType && (
                          <p className="mt-2 text-xs text-red-300/80">
                            Select a document type.
                          </p>
                        )}

                    </div>

                    <Input
                      {...inputProps}
                      name="documentNumber"
                      label="Document number"
                      placeholder="1234567890"
                      type="text"
                      maxLength={10}
                      inputMode="numeric"
                    />

                  </div>

                </div>

                {/* =========================
                    CONTACTO
                ========================== */}

                <div>

                  <div className="mb-6 flex items-center gap-4">

                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#9caf88]">
                      03
                    </span>

                    <span className="h-px flex-1 bg-white/10" />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Contact information
                    </span>

                  </div>

                  <div className="space-y-5">

                    <Input
                      {...inputProps}
                      name="address"
                      label="Address"
                      placeholder="Calle 00 #00-00"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">

                      <Input
                        {...inputProps}
                      name="phone"
                      label="Phone"
                      placeholder="3001234567"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      />

                      <Input
                        {...inputProps}
                      name="email"
                      label="Email address"
                      placeholder="you@example.com"
                      type="email"
                      maxLength={100}
                      />

                    </div>

                  </div>

                </div>

                {/* =========================
                    SEGURIDAD
                ========================== */}

                <div>

                  <div className="mb-6 flex items-center gap-4">

                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#9caf88]">
                      04
                    </span>

                    <span className="h-px flex-1 bg-white/10" />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Security
                    </span>

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* PASSWORD */}

                    <div>

                      <label
                        htmlFor="password"
                        className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                      >
                        Password
                      </label>

                      <div className="relative">

                        <input
                          id="password"
                          name="password"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          value={form.password}
                          onChange={handleChange}
                          onBlur={() =>
                            handleBlur('password')
                          }
                          placeholder="••••••••"
                          className={`w-full border bg-white/[0.03] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 ${getInputClasses(
                            'password'
                          )}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-white/30 transition hover:text-[#9caf88]"
                        >
                          {showPassword
                            ? 'Hide'
                            : 'Show'}
                        </button>

                      </div>

                      {touched.password &&
                        !validations.password && (
                          <p className="mt-2 text-xs text-red-300/80">
                            Password must be at least 6 characters.
                          </p>
                        )}

                    </div>

                    {/* CONFIRM PASSWORD */}

                    <div>

                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                      >
                        Confirm password
                      </label>

                      <div className="relative">

                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={
                            showConfirmPassword
                              ? 'text'
                              : 'password'
                          }
                          value={form.confirmPassword}
                          onChange={handleChange}
                          onBlur={() =>
                            handleBlur(
                              'confirmPassword'
                            )
                          }
                          placeholder="••••••••"
                          className={`w-full border bg-white/[0.03] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 ${getInputClasses(
                            'confirmPassword'
                          )}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-white/30 transition hover:text-[#9caf88]"
                        >
                          {showConfirmPassword
                            ? 'Hide'
                            : 'Show'}
                        </button>

                      </div>

                      {touched.confirmPassword &&
                        !validations.confirmPassword && (
                          <p className="mt-2 text-xs text-red-300/80">
                            Passwords do not match.
                          </p>
                        )}

                    </div>

                  </div>

                </div>

                {/* =========================
                    MENSAJE DEL SERVIDOR
                ========================== */}

                {serverMessage && (
                  <p className="text-center text-sm text-red-300/80">
                    {serverMessage}
                  </p>
                )}

                {/* =========================
                    BOTÓN
                ========================== */}

                <button
                  type="submit"
                  disabled={!formValid || loading}
                  className={`w-full py-4 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                    formValid && !loading
                      ? 'bg-[#9caf88] text-[#07100b] hover:bg-[#b7c7a5]'
                      : 'cursor-not-allowed bg-white/10 text-white/20'
                  }`}
                >
                  {loading
                    ? 'Creating account...'
                    : 'Create account'}
                </button>

              </form>

              {/* =========================
                  LOGIN
              ========================== */}

              <div className="mt-10 text-center">

                <p className="text-xs text-white/30">

                  Already have an account?

                  <Link
                    to="/login"
                    className="ml-2 text-[#9caf88] transition hover:text-[#b7c7a5]"
                  >
                    Sign in
                  </Link>

                </p>

              </div>

            </>

          ) : (

            /* =========================
               REGISTRO COMPLETADO
            ========================== */

            <div className="py-16 text-center">

              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#9caf88]/30 bg-[#9caf88]/5">

                <span className="text-2xl text-[#9caf88]">
                  ✓
                </span>

              </div>

              <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#9caf88]">
                Welcome
              </p>

              <h1 className="text-4xl font-light sm:text-5xl">
                Account created
              </h1>

              <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/40">
                Your account has been created
                successfully. You can now continue
                to sign in.
              </p>

              <Link
                to="/login"
                className="mt-10 inline-flex border border-white/10 px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-white/60 transition duration-300 hover:border-[#9caf88]/50 hover:bg-[#9caf88]/5 hover:text-[#b7c7a5]"
              >
                Go to sign in
              </Link>

            </div>

          )}

        </div>
      </div>
    </main>
  );
}
