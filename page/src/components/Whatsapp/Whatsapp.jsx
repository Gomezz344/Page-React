function WhatsAppButton() {
  const phoneNumber = "573001234567";
  const message = "Hola, quisiera obtener más información.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="
        fixed bottom-6 right-6 z-50
        flex h-14 w-14 items-center justify-center
        rounded-full
        bg-[#25D366] text-white
        shadow-lg
        transition-all duration-300
        hover:scale-110
        hover:shadow-xl
      "
    >
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8"
        fill="currentColor"
      >
        <path d="M19.11 17.19c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.64 1.11 2.82c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.57.66.21 1.26.18 1.74.11.53-.08 1.6-.66 1.83-1.3.23-.64.23-1.19.16-1.3-.07-.11-.25-.18-.52-.32z" />

        <path d="M16.03 3.2c-7.08 0-12.83 5.75-12.83 12.83 0 2.26.59 4.46 1.72 6.4L3.09 28.8l6.52-1.71a12.79 12.79 0 0 0 6.42 1.73h.01c7.08 0 12.83-5.75 12.83-12.83S23.11 3.2 16.03 3.2zm0 23.48h-.01a10.65 10.65 0 0 1-5.43-1.48l-.39-.23-3.87 1.02 1.03-3.77-.25-.39a10.62 10.62 0 1 1 8.92 4.85z" />
      </svg>
    </a>
  );
}

export default WhatsAppButton;