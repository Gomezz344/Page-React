import { useState } from 'react';
import { Link } from 'react-router-dom';

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


  /* =========================
     VALIDACIONES
  ========================== */

  const validations = {
    firstName:
      form.firstName.trim().length >= 2,

    lastName:
      form.lastName.trim().length >= 2,

    documentType:
      form.documentType !== '',

    documentNumber:
      /^\d{5,15}$/.test(form.documentNumber),

    address:
      form.address.trim().length >= 5,

    phone:
      /^\d{7,15}$/.test(form.phone),

    email:
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),

    password:
      form.password.length >= 6,

    confirmPassword:
      form.confirmPassword.length > 0 &&
      form.confirmPassword === form.password,
  };


  const formValid =
    Object.values(validations).every(Boolean);


  /* =========================
     CAMBIAR CAMPOS
  ========================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Si vuelve a escribir después de un error,
    // mantenemos la validación actualizada.
    setTouched({
      ...touched,
      [name]: true,
    });

    setRegistered(false);
  };


  /* =========================
     BLUR
  ========================== */

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true,
    });
  };


  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = (e) => {
    e.preventDefault();

    const allTouched = {};

    Object.keys(validations).forEach((field) => {
      allTouched[field] = true;
    });

    setTouched(allTouched);

    if (!formValid) return;

    // Por ahora solamente visual.
    setRegistered(true);
  };


  /* =========================
     INPUT CLASSES
  ========================== */

  const getInputClasses = (field) => {

    if (!touched[field]) {
      return 'border-white/10 focus:border-[#9caf88]/60';
    }

    if (!validations[field]) {
      return 'border-red-400/50 focus:border-red-400';
    }

    return 'border-[#9caf88]/60 focus:border-[#9caf88]';
  };


  /* =========================
     COMPONENTE DE INPUT
  ========================== */

  const Input = ({
    name,
    label,
    type = 'text',
    placeholder,
    className = '',
  }) => (

    <div className={className}>

      <label
        htmlFor={name}
        className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
      >
        {label}
      </label>

      <div className="relative">

        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          onBlur={() => handleBlur(name)}
          placeholder={placeholder}
          className={`w-full border bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 ${getInputClasses(name)}`}
        />

        {touched[name] && validations[name] && (

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9caf88]">
            ✓
          </span>

        )}

      </div>


      {touched[name] && !validations[name] && (

        <p className="mt-2 text-xs text-red-300/80">

          {name === 'firstName' &&
            'El nombre es obligatorio.'}

          {name === 'lastName' &&
            'El apellido es obligatorio.'}

          {name === 'documentNumber' &&
            'Ingresa un número de documento válido.'}

          {name === 'address' &&
            'Ingresa una dirección válida.'}

          {name === 'phone' &&
            'Ingresa un número de teléfono válido.'}

          {name === 'email' &&
            'Ingresa un correo electrónico válido.'}

        </p>

      )}

    </div>

  );


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
                      name="firstName"
                      label="Nombre"
                      placeholder="Tu nombre"
                    />

                    <Input
                      name="lastName"
                      label="Apellido"
                      placeholder="Tu apellido"
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


                    {/* Tipo documento */}

                    <div>

                      <label
                        htmlFor="documentType"
                        className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                      >
                        Tipo de documento
                      </label>

                      <select
                        id="documentType"
                        name="documentType"
                        value={form.documentType}
                        onChange={handleChange}
                        onBlur={() =>
                          handleBlur('documentType')
                        }
                        className={`w-full border bg-[#0b160f] px-4 py-3 text-sm outline-none transition ${getInputClasses('documentType')}`}
                      >

                        <option value="">
                          Selecciona una opción
                        </option>

                        <option value="CC">
                          Cédula de ciudadanía
                        </option>

                        <option value="CE">
                          Cédula de extranjería
                        </option>

                        <option value="TI">
                          Tarjeta de identidad
                        </option>

                        <option value="PASSPORT">
                          Pasaporte
                        </option>

                      </select>


                      {touched.documentType &&
                        !validations.documentType && (

                          <p className="mt-2 text-xs text-red-300/80">
                            Selecciona un tipo de documento.
                          </p>

                        )}

                    </div>


                    <Input
                      name="documentNumber"
                      label="Número de documento"
                      placeholder="1234567890"
                      type="text"
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
                      name="address"
                      label="Dirección"
                      placeholder="Calle 00 #00-00"
                    />


                    <div className="grid gap-5 sm:grid-cols-2">

                      <Input
                        name="phone"
                        label="Teléfono"
                        placeholder="3001234567"
                        type="tel"
                      />

                      <Input
                        name="email"
                        label="Correo electrónico"
                        placeholder="you@example.com"
                        type="email"
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
                        Contraseña
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
                          className={`w-full border bg-white/[0.03] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 ${getInputClasses('password')}`}
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
                            La contraseña debe tener
                            al menos 6 caracteres.
                          </p>

                        )}

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div>

                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                      >
                        Confirmar contraseña
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
                          value={
                            form.confirmPassword
                          }
                          onChange={handleChange}
                          onBlur={() =>
                            handleBlur(
                              'confirmPassword'
                            )
                          }
                          placeholder="••••••••"
                          className={`w-full border bg-white/[0.03] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 ${getInputClasses('confirmPassword')}`}
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
                            Las contraseñas no coinciden.
                          </p>

                        )}

                    </div>

                  </div>

                </div>


                {/* =========================
                    BOTÓN
                ========================== */}

                <button
                  type="submit"
                  disabled={!formValid}
                  className={`w-full py-4 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                    formValid
                      ? 'bg-[#9caf88] text-[#07100b] hover:bg-[#b7c7a5]'
                      : 'cursor-not-allowed bg-white/10 text-white/20'
                  }`}
                >
                  Create account
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