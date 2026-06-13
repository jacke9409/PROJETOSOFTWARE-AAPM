import os
from typing import Optional, List
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
from app.models.fornecedor import Fornecedor 
# Nota: Certifique-se de que o seu model de Venda está criado em app.models.venda
try:
    from app.models.venda import Venda
except ImportError:
    # Caso ainda não tenha criado o modelo de banco de dados para vendas,
    # descomente ou configure sua tabela correspondente.
    Venda = None

app = FastAPI()

# Contexto para checar a senha criptografada em BCrypt vinda do seed.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Aponta para onde a pasta templates REALMENTE está
templates = Jinja2Templates(directory="app/routers/templates")

# Monta a pasta static da raiz corretamente no FastAPI
app.mount("/static", StaticFiles(directory="static"), name="static")


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMAS PYDANTIC (VALIDAÇÃO DE ENTRADAS JSON)
# ─────────────────────────────────────────────────────────────────────────────

class ProdutoSchema(BaseModel):
    nome: str
    preco: float
    tamanho: str
    disponivel: Optional[int] = 1
    categoria_id: Optional[int] = None  
    imagem_url: Optional[str] = ""

class CategoriaSchema(BaseModel):
    nome: str

class FornecedorSchema(BaseModel):
    nome_fantasia: str
    cnpj: str
    telefone: str
    email: Optional[str] = None
    localidade: str
    nome_contato: Optional[str] = None

class VendaSchema(BaseModel):
    comprador: str
    produto_id: int
    quantidade: int
    preco_total: float


# ─────────────────────────────────────────────────────────────────────────────
# ROTAS PÚBLICAS & AUTENTICAÇÃO
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def pagina_inicial(request: Request):
    return templates.TemplateResponse(request=request, name="base.html")


@app.get("/login", response_class=HTMLResponse)
async def pagina_login(request: Request):
    return templates.TemplateResponse(request=request, name="auth/login.html")


@app.get("/visualizacao", response_class=HTMLResponse)
async def pagina_visualizacao(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    return templates.TemplateResponse(
        request=request, 
        name="public/visualizacao.html", 
        context={"produtos": produtos_do_banco}
    )


@app.post("/auth/login")
async def processar_login(
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.email == username).first()
    
    if usuario and pwd_context.verify(password, usuario.senha):
        return {
            "status": "sucesso", 
            "nome": usuario.nome, 
            "role": usuario.role
        }
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="E-mail ou senha incorretos."
    )


# ─────────────────────────────────────────────────────────────────────────────
# ROTAS DO PAINEL ADMINISTRATIVO (VIEWS)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/dashboard", response_class=HTMLResponse)
async def pagina_dashboard(request: Request, db: Session = Depends(get_db)):
    total_produtos = db.query(Produto).count()
    total_categorias = db.query(Categoria).count()
    total_fornecedores = db.query(Fornecedor).count()
    
    produtos_do_banco = db.query(Produto).all()
    categorias_do_banco = db.query(Categoria).all()
    fornecedores_do_banco = db.query(Fornecedor).all()
    
    categorias_json = [{"id": c.id, "nome": c.nome} for c in categorias_do_banco]
    fornecedores_json = [
        {
            "id": f.id,
            "nome_fantasia": f.nome_fantasia,
            "cnpj": f.cnpj,
            "telefone": f.telefone,
            "email": f.email,
            "localidade": f.localidade,
            "nome_contato": f.nome_contato
        }
        for f in fornecedores_do_banco
    ]
    
    return templates.TemplateResponse(
        request=request,
        name="admin/dashboard.html",  
        context={
            "total_produtos": total_produtos,
            "total_categorias": total_categorias,
            "total_fornecedores": total_fornecedores,
            "produtos": produtos_do_banco,
            "categories": categorias_do_banco,
            "fornecedores": fornecedores_do_banco,
            "categorias_json": categorias_json,  # CORRIGIDO: Agora aponta exatamente para a variável correta
            "fornecedores_json": fornecedores_json
        }
    )


@app.get("/dashboard/produtos", response_class=HTMLResponse)
async def pagina_dashboard_produtos(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    categorias_do_banco = db.query(Categoria).all()  
    
    return templates.TemplateResponse(
        request=request,
        name="admin/produtos.html",
        context={
            "produtos": produtos_do_banco,
            "categorias": categorias_do_banco  
        }
    )


@app.get("/dashboard/categorias", response_class=HTMLResponse)
async def pagina_dashboard_categorias(request: Request, db: Session = Depends(get_db)):
    categorias_do_banco = db.query(Categoria).all()
    categorias_serializadas = [{"id": cat.id, "nome": cat.nome} for cat in categorias_do_banco]
    
    return templates.TemplateResponse(
        request=request,
        name="admin/categorias.html",
        context={
            "categories": categorias_do_banco,
            "categorias_json": categorias_serializadas
        }
    )


@app.get("/dashboard/fornecedores", response_class=HTMLResponse)
async def pagina_dashboard_fornecedores(request: Request, db: Session = Depends(get_db)):
    fornecedores_do_banco = db.query(Fornecedor).all()
    
    fornecedores_serializados = [
        {
            "id": f.id,
            "nome_fantasia": f.nome_fantasia,
            "cnpj": f.cnpj,
            "telefone": f.telefone,
            "email": f.email,
            "localidade": f.localidade,
            "nome_contato": f.nome_contato
        }
        for f in fornecedores_do_banco
    ]
    
    return templates.TemplateResponse(
        request=request, 
        name="admin/fornecedores.html",
        context={
            "fornecedores": fornecedores_do_banco,
            "fornecedores_json": fornecedores_serializados
        }
    )


@app.get("/dashboard/vendas", response_class=HTMLResponse)
async def pagina_dashboard_vendas(request: Request, db: Session = Depends(get_db)):
    # 1. Coleta os produtos ativos para preencher o select do Modal
    produtos_do_banco = db.query(Produto).filter(Produto.disponivel == True).all()
    
    # 2. Coleta o histórico de vendas salvas
    vendas_do_banco = []
    faturamento_calculado = 0.0
    
    if Venda:
        vendas_do_banco = db.query(Venda).order_by(Venda.id.desc()).all()
        # Calcula o somatório de faturamento total das vendas realizadas
        faturamento_calculado = sum(v.preco_total for v in vendas_do_banco)
    
    return templates.TemplateResponse(
        request=request, 
        name="admin/vendas.html",
        context={
            "produtos": produtos_do_banco,
            "vendas": vendas_do_banco,
            "faturamento_total": f"{faturamento_calculado:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# API REST (CRUD PRODUTOS, CATEGORIAS, FORNECEDORES & VENDAS)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/assets/imagens")
async def listar_imagens_galeria():
    caminho_pasta = os.path.join("static", "assets")
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


# --- CRUD PRODUTOS ---

@app.post("/admin/produtos")
async def criar_produto(dados: ProdutoSchema, db: Session = Depends(get_db)):
    novo = Produto(
        nome         = dados.nome,
        preco        = dados.preco,
        tamanho      = dados.tamanho,
        disponivel   = bool(dados.disponivel),
        categoria_id = dados.categoria_id,  
        imagem_url   = dados.imagem_url
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
    
    produto.nome = dados.nome
    produto.preco = dados.preco
    produto.tamanho = dados.tamanho
    produto.disponivel = bool(dados.disponivel)
    produto.categoria_id = dados.categoria_id  
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


# --- CRUD CATEGORIAS ---

@app.post("/admin/categorias")
async def criar_categoria(dados: CategoriaSchema, db: Session = Depends(get_db)):
    nova = Categoria(nome=dados.nome)
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return {"status": "criado", "id": nova.id}


@app.put("/admin/categorias/{categoria_id}")
async def atualizar_categoria(categoria_id: int, dados: CategoriaSchema, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == category_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    
    categoria.nome = dados.nome
    db.commit()
    return {"status": "atualizado"}


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


# --- CRUD FORNECEDORES ---

@app.post("/admin/fornecedores")
async def criar_fornecedor(dados: FornecedorSchema, db: Session = Depends(get_db)):
    cnpj_existente = db.query(Fornecedor).filter(Fornecedor.cnpj == dados.cnpj).first()
    if cnpj_existente:
        raise HTTPException(status_code=400, detail="Já existe um fornecedor cadastrado com este CNPJ.")

    novo = Fornecedor(
        nome_fantasia = dados.nome_fantasia,
        cnpj          = dados.cnpj,
        telefone      = dados.telefone,
        email         = dados.email,
        localidade    = dados.localidade,
        nome_contato  = dados.nome_contato
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"status": "criado", "id": novo.id}


@app.put("/admin/fornecedores/{fornecedor_id}")
async def atualizar_fornecedor(fornecedor_id: int, dados: FornecedorSchema, db: Session = Depends(get_db)):
    fornecedor = db.query(Fornecedor).filter(Fornecedor.id == fornecedor_id).first()
    if not fornecedor:  # CORRIGIDO: Estava 'supplier', o que causava NameError interno
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado.")
    
    fornecedor.nome_fantasia = dados.nome_fantasia
    fornecedor.cnpj          = dados.cnpj
    fornecedor.telefone      = dados.telefone
    fornecedor.email         = dados.email
    fornecedor.localidade    = dados.localidade
    fornecedor.nome_contato  = dados.nome_contato
    
    db.commit()
    return {"status": "atualizado"}


@app.delete("/admin/fornecedores/{fornecedor_id}")
async def deletar_fornecedor(fornecedor_id: int, db: Session = Depends(get_db)):
    fornecedor = db.query(Fornecedor).filter(Fornecedor.id == fornecedor_id).first()
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado.")
    
    db.delete(fornecedor)
    db.commit()
    return {"status": "deletado"}


# --- INTERFACE REST PARA VENDAS (Mapeado corretamente) ---

# --- INTERFACE REST PARA VENDAS (CORREÇÃO DEFINITIVA) ---

@app.post("/admin/vendas")
async def registrar_venda(dados: VendaSchema, db: Session = Depends(get_db)):
    # Caso o bloco try/except lá em cima tenha falhado, importamos diretamente aqui para ver o erro real
    from app.models.venda import Venda
    
    # Verifica se o produto vendido existe no estoque
    produto = db.query(Produto).filter(Produto.id == dados.produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto vendido não encontrado no sistema.")

    # Criando o objeto com o parâmetro 'comprador' que seu banco exige
    nova_venda = Venda(
        comprador=dados.comprador,
        produto_id=dados.produto_id,
        quantidade=dados.quantidade,
        preco_total=dados.preco_total
    )
    
    db.add(nova_venda)
    db.commit()
    db.refresh(nova_venda)
    return {"status": "criado", "id": nova_venda.id}