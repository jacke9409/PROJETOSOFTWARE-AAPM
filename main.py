from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base

# IMPORTANTE: Para o SQLAlchemy saber quais tabelas criar, 
# precisamos importar os modelos aqui antes de dar o "create_all"
from app.models.categoria import Categoria
# (Depois vamos importando os outros modelos aqui: usuario, produto, etc.)

# Cria as tabelas no banco de dados se elas não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gerenciamento de Estoque - AAPM")

# Configuração para arquivos estáticos (CSS, JS, Imagens de Assets)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {"status": "Sucesso", "mensagem": "O backend está conectado ao banco de dados!"}