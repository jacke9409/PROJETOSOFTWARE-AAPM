from fastapi import FastAPI, Request, Depends, Form, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Importações da estrutura do projeto
from app.database import get_db
from app.models.produto import Produto
from app.models.categoria import Categoria
from app.models.usuario import Usuario  # Garanta que o modelo Usuario está mapeado
import os
from fastapi.responses import JSONResponse

app = FastAPI()

# Contexto para checar a senha criptografada em BCrypt vinda do seed.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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


# 📊 SPRINT 3: Lista de Visualização puxando os produtos do MySQL
@app.get("/visualizacao", response_class=HTMLResponse)
async def pagina_visualizacao(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    return templates.TemplateResponse(
        request=request, 
        name="public/visualizacao.html", 
        context={"produtos": produtos_do_banco}
    )


# 🔑 SPRINT 2: Rota que processa o login integrado ao Banco de Dados
@app.post("/auth/login")
async def processar_login(
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # 1. Busca o usuário cadastrado no MySQL pelo email informado
    usuario = db.query(Usuario).filter(Usuario.email == username).first()
    
    # 2. Valida se o usuário existe e se a senha criptografada confere
    if usuario and pwd_context.verify(password, usuario.senha):
        # Retorna sucesso em formato JSON para o JavaScript processar e mudar de página
        return {
            "status": "sucesso", 
            "nome": usuario.nome, 
            "role": usuario.role
        }
        
    # 3. Retorna erro de credencial caso os dados estejam incorretos
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="E-mail ou senha incorretos."
    )


# 📊 SPRINT 2 CORRIGIDA: Dashboard unificada renderizando a pasta admin/
@app.get("/dashboard", response_class=HTMLResponse)
async def pagina_dashboard(request: Request, db: Session = Depends(get_db)):
    # Busca os dados reais do seu banco de dados
    produtos_do_banco = db.query(Produto).all()
    categorias_do_banco = db.query(Categoria).all()
    
    # Retorna o template correto passando as coleções de dados
    return templates.TemplateResponse(
        request=request,
        name="admin/dashboard.html",  
        context={
            "produtos": produtos_do_banco,
            "categorias": categorias_do_banco
        }
    )
# =================================================================
# ROTAS DO PAINEL ADMINISTRATIVO (VERSÃO FINAL UNIFICADA)
# =================================================================

# Rota base do painel (Boas-vindas padrão)
@app.get("/dashboard", response_class=HTMLResponse)
async def pagina_dashboard(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="admin/dashboard.html"
    )

# 1. Rota para Listar os Produtos
@app.get("/dashboard/produtos", response_class=HTMLResponse)
async def pagina_dashboard_produtos(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    
    return templates.TemplateResponse(
        request=request,
        name="admin/produtos.html",
        context={"produtos": produtos_do_banco}
    )

# 2. Rota para Listar as Categorias
@app.get("/dashboard/categorias", response_class=HTMLResponse)
async def pagina_dashboard_categorias(request: Request, db: Session = Depends(get_db)):
    categorias_do_banco = db.query(Categoria).all()
    
    return templates.TemplateResponse(
        request=request,
        name="admin/categorias.html",
        context={"categorias": categorias_do_banco}
    )

# 3. Rota para Fornecedores
@app.get("/dashboard/fornecedores", response_class=HTMLResponse)
async def pagina_dashboard_fornecedores(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="admin/fornecedores.html"
    )

# 4. Rota para Visualizar o Histórico de Vendas (Substituindo Usuários)
@app.get("/dashboard/vendas", response_class=HTMLResponse)
async def pagina_dashboard_vendas(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="admin/vendas.html"
    )

# ================================================================
# ADICIONE TAMBÉM ESSAS 3 ROTAS DE CRUD DE PRODUTOS (POST, PUT, DELETE)
# se ainda não tiver no seu main.py
# ================================================================
from pydantic import BaseModel
from typing import Optional
 
class ProdutoSchema(BaseModel):
    nome: str
    preco: float
    tamanho: str
    disponivel: Optional[int] = 1
    imagem_url: Optional[str] = ""
 
@app.post("/admin/produtos")
async def criar_produto(dados: ProdutoSchema, db: Session = Depends(get_db)):
    novo = Produto(
        nome       = dados.nome,
        preco      = dados.preco,
        tamanho    = dados.tamanho,
        disponivel = bool(dados.disponivel),
        imagem_url = dados.imagem_url
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"status": "criado", "id": novo.id}
 
@app.put("/admin/produtos/{produto_id}")
async def atualizar_produto(produto_id: int, dados: ProdutoSchema, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    produto.nome       = dados.nome
    produto.preco      = dados.preco
    produto.tamanho    = dados.tamanho
    produto.disponivel = bool(dados.disponivel)
    produto.imagem_url = dados.imagem_url
    db.commit()
    return {"status": "atualizado"}
 
@app.delete("/admin/produtos/{produto_id}")
async def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    db.delete(produto)
    db.commit()
    return {"status": "deletado"}

# ================================================================
# ADICIONE TAMBÉM ESSAS 3 ROTAS DE CRUD DE PRODUTOS (POST, PUT, DELETE)
# se ainda não tiver no seu main.py
# ================================================================
from pydantic import BaseModel
from typing import Optional
 
class ProdutoSchema(BaseModel):
    nome: str
    preco: float
    tamanho: str
    disponivel: Optional[int] = 1
    imagem_url: Optional[str] = ""
 
@app.post("/admin/produtos")
async def criar_produto(dados: ProdutoSchema, db: Session = Depends(get_db)):
    novo = Produto(
        nome       = dados.nome,
        preco      = dados.preco,
        tamanho    = dados.tamanho,
        disponivel = bool(dados.disponivel),
        imagem_url = dados.imagem_url
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"status": "criado", "id": novo.id}
 
@app.put("/admin/produtos/{produto_id}")
async def atualizar_produto(produto_id: int, dados: ProdutoSchema, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    produto.nome       = dados.nome
    produto.preco      = dados.preco
    produto.tamanho    = dados.tamanho
    produto.disponivel = bool(dados.disponivel)
    produto.imagem_url = dados.imagem_url
    db.commit()
    return {"status": "atualizado"}
 
@app.delete("/admin/produtos/{produto_id}")
async def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    db.delete(produto)
    db.commit()
    return {"status": "deletado"}