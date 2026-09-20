const Input = ({
  name,
  label,
  type = 'text',
  placeholder,
  className = '',
  form,
  handleChange,
  handleBlur,
  touched,
  validations,
  getInputClasses,
}) => {
  return (
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
          className={`w-full border bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 ${getInputClasses(
            name
          )}`}
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
            'First name is required.'}

          {name === 'lastName' &&
            'Last name is required.'}

          {name === 'documentNumber' &&
            'Enter a valid document number.'}

          {name === 'address' &&
            'Enter a valid address.'}

          {name === 'phone' &&
            'Enter a valid phone number.'}

          {name === 'email' &&
            'Enter a valid email address.'}
        </p>
      )}
    </div>
  );
};

export default Input;