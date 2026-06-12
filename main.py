from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

# Importa a dependência, engine e os modelos estruturados
from app.database import get_db
from app.models.produto import Produto
from app.models.categoria import Categoria

app = FastAPI()

# Aponta para onde a pasta templates REALMENTE está
templates = Jinja2Templates(directory="app/routers/templates")

# Monta a pasta static da raiz corretamente no FastAPI
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def pagina_inicial(request: Request):
    return templates.TemplateResponse(request=request, name="base.html")

@app.get("/login", response_class=HTMLResponse)
async def pagina_login(request: Request):
    return templates.TemplateResponse(request=request, name="auth/login.html")

# 📊 SPRINT 3: Lista de Visualização puxando os 88 produtos do MySQL
@app.get("/visualizacao", response_class=HTMLResponse)
async def pagina_visualizacao(request: Request, db: Session = Depends(get_db)):
    # Busca a lista real da AAPM que injetamos via seed.py
    produtos_do_banco = db.query(Produto).all()
    
    return templates.TemplateResponse(
        request=request, 
        name="public/visualizacao.html", 
        context={"produtos": produtos_do_banco}
    )

# 🔑 SPRINT 2: Dashboard Inicial com controle de dados do banco
@app.get("/dashboard", response_class=HTMLResponse)
async def pagina_dashboard(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    categorias_do_banco = db.query(Categoria).all()
    
    return templates.TemplateResponse(
        request=request, 
        name="dashboard.html", 
        context={
            "produtos": produtos_do_banco, 
            "categorias": categorias_do_banco
        }
    )