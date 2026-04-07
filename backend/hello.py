from fastapi import FastAPI
from workers import WorkerEntrypoint
import asgi

app = FastAPI()

@app.get("/")
async def hello():
    return {"status": "success", "message": "Si puedes ver esto, FastAPI esta funcionando en Cloudflare"}

class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return await asgi.fetch(app, request, self.env)
