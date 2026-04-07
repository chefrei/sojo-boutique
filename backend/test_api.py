import urllib.request
import json

def test_root():
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/") as response:
            data = json.load(response)
            print(f"Root: {data}")
            return data["status"] == "online"
    except Exception as e:
        print(f"Error en root: {e}")
        return False

def test_products():
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/products/") as response:
            data = json.load(response)
            print(f"Productos encontrados: {len(data)}")
            return len(data) > 0
    except Exception as e:
        print(f"Error en productos: {e}")
        return False

if __name__ == "__main__":
    # Nota: Este script requiere que uvicorn esté corriendo.
    # Como no puedo correr uvicorn en background y luego este script fácilmente en un solo paso sin herramientas adicionales,
    # solo lo dejo aquí como referencia o lo ejecuto si puedo lanzar el servidor.
    print("Iniciando pruebas...")
    # (En este entorno, no puedo lanzar el servidor y esperar a que responda de forma síncrona fácilmente)
