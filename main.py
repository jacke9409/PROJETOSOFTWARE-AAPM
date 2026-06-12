from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI()

# Aponta para onde a pasta templates REALMENTE está
templates = Jinja2Templates(directory="app/routers/templates")

# AQUI ESTÁ A CORREÇÃO: Montando a pasta static da raiz corretamente no FastAPI
app.mount("/static", StaticFiles(directory="static"), name="static")

from fastapi import Request
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def pagina_inicial(request: Request):
    # Colocamos o "context=" explicitamente antes do dicionário
   return templates.TemplateResponse(request=request, name="base.html")
@app.get("/login", response_class=HTMLResponse)
async def pagina_login(request: Request):
    return templates.TemplateResponse(request=request, name="auth/login.html")

@app.get("/visualizacao", response_class=HTMLResponse)
async def pagina_visualizacao(request: Request):
    return templates.TemplateResponse(request=request, name="public/visualizacao.html")