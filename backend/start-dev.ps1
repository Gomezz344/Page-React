param(
    [int]$Port = 8001
)

# Algunas instalaciones locales dejan un proxy muerto en 127.0.0.1:9.
# Stripe necesita salida HTTPS directa durante el desarrollo.
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""

& .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port $Port --reload
