import os
from typing import Optional
from fastapi import FastAPI, Request, Depends, Form, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel

# Importações da estrutura do projeto
from app.database import get_db
from app.models.produto import Produto
from app.models.categoria import Categoria
from app.models.usuario import Usuario

app = FastAPI()

# Contexto para checar a senha criptografada em BCrypt vinda do seed.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Aponta para onde a pasta templates REALMENTE está
templates = Jinja2Templates(directory="app/routers/templates")

# Monta a pasta static da raiz corretamente no FastAPI
app.mount("/static", StaticFiles(directory="static"), name="static")


# Schemas Pydantic para validação de dados recebidos via JSON
class ProdutoSchema(BaseModel):
    nome: str
    preco: float
    tamanho: str
    disponivel: Optional[int] = 1
    imagem_url: Optional[str] = ""


# ─────────────────────────────────────────────────────────────────────────────
# ROTAS PÚBLICAS & AUTENTICAÇÃO
# ─────────────────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────────────────
# ROTAS DO PAINEL ADMINISTRATIVO (VIEWS)
# ─────────────────────────────────────────────────────────────────────────────

# Dashboard unificada renderizando os dados reais do banco
@app.get("/dashboard", response_class=HTMLResponse)
async def pagina_dashboard(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    categorias_do_banco = db.query(Categoria).all()
    
    # Pré-serializa para evitar erros de JSON na view principal se necessário
    categorias_json = [{"id": c.id, "nome": c.nome} for c in categorias_do_banco]
    
    return templates.TemplateResponse(
        request=request,
        name="admin/dashboard.html",  
        context={
            "produtos": produtos_do_banco,
            "categorias": categorias_do_banco,
            "categorias_json": categorias_json
        }
    )


# Rota para Listar os Produtos
@app.get("/dashboard/produtos", response_class=HTMLResponse)
async def pagina_dashboard_produtos(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    return templates.TemplateResponse(
        request=request,
        name="admin/produtos.html",
        context={"produtos": produtos_do_banco}
    )


# Rota para Listar as Categorias (CORRIGIDA COM SERIALIZAÇÃO ANTIEP強ICO)
@app.get("/dashboard/categorias", response_class=HTMLResponse)
async def pagina_dashboard_categorias(request: Request, db: Session = Depends(get_db)):
    categorias_do_banco = db.query(Categoria).all()
    
    # Converte os objetos do SQLAlchemy para dicionários comuns do Python
    categorias_serializadas = [{"id": cat.id, "nome": cat.nome} for cat in categorias_do_banco]
    
    return templates.TemplateResponse(
        request=request,
        name="admin/categorias.html",
        context={
            "categorias": categorias_do_banco,       # Alimenta o loop `for` do HTML da tabela
            "categorias_json": categorias_serializadas # Alimenta de forma limpa o atributo data-categorias do JS
        }
    )


# Rota para Fornecedores
@app.get("/dashboard/fornecedores", response_class=HTMLResponse)
async def pagina_dashboard_fornecedores(request: Request):
    return templates.TemplateResponse(request=request, name="admin/fornecedores.html")


# Rota para Visualizar o Histórico de Vendas
@app.get("/dashboard/vendas", response_class=HTMLResponse)
async def pagina_dashboard_vendas(request: Request):
    return templates.TemplateResponse(request=request, name="admin/vendas.html")


# ─────────────────────────────────────────────────────────────────────────────
# API REST (CRUD PRODUTOS, CATEGORIAS & GALERIA DE ASSETS)
# ─────────────────────────────────────────────────────────────────────────────

# Rota dinâmica que lê a pasta static/assets e abastece a galeria do JS
@app.get("/admin/assets/imagens")
async def listar_imagens_galeria():
    caminho_pasta = os.path.join("static", "assets")
    
    # Se a pasta não existir no servidor, cria ela vazia preventivamente
    if not os.path.exists(caminho_pasta):
        os.makedirs(caminho_pasta)
        return {"imagens": []}
        
    try:
        extensoes_permitidas = (".png", ".jpg", ".jpeg", ".svg", ".webp")
        arquivos = os.listdir(caminho_pasta)
        
        imagens = [
            f"/static/assets/{arq}" 
            for arq in arquivos 
            if arq.lower().endswith(extensoes_permitidas)
        ]
        return {"imagens": sorted(imagens)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler pasta de mídias: {str(e)}")


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


# 🌟 NOVA ROTA ADICIONADA: Deleta Categorias com proteção contra restrição de chave estrangeira
@app.delete("/admin/categorias/{categoria_id}")
async def deletar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    
    try:
        db.delete(categoria)
        db.commit()
        return {"status": "deletado"}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Não é possível deletar esta categoria pois existem produtos vinculados a ela."
        )