import os
from typing import Optional
from fastapi import FastAPI, Request, Depends, Form, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel

# Importações da estrutura do projeto
from app.database import get_db
from app.models.produto import Produto
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.models.fornecedor import Fornecedor 

try:
    from app.models.venda import Venda
except ImportError:
    Venda = None

app = FastAPI()

# Contexto para checar a senha criptografada em BCrypt vinda do seed.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURAÇÃO DE CAMINHOS CORRIGIDA (MAIN NA RAIZ PRINCIPAL DO PROJETO)
# ─────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Aponta para a pasta templates que está dentro de app/routers/templates
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "app", "routers", "templates"))

# Aponta para a pasta static que está diretamente na raiz junto com o main.py
caminho_static_correto = os.path.join(BASE_DIR, "static")
app.mount("/static", StaticFiles(directory=caminho_static_correto), name="static")


# ─────────────────────────────────────────────────────────────────────────────
# HANDLERS DE EXCEÇÃO PERSONALIZADOS (ERRO 404 - NOT FOUND)
# ─────────────────────────────────────────────────────────────────────────────

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    if request.url.path.startswith("/admin"):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "status": "erro",
                "mensagem": f"O recurso ou endpoint '{request.url.path}' não foi encontrado no sistema."
            }
        )
    
    return templates.TemplateResponse(
        request=request,
        name="public/404.html",
        status_code=status.HTTP_404_NOT_FOUND
    )


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
async def pagina_inicial(request: Request, db: Session = Depends(get_db)):
    try:
        produtos_do_banco = db.query(Produto).all()
    except Exception as e:
        print(f"❌ Erro ao buscar produtos no banco: {e}")
        produtos_do_banco = []
        
    return templates.TemplateResponse(
        request=request, 
        name="base.html",
        context={"produtos": produtos_do_banco}
    )


@app.get("/login", response_class=HTMLResponse)
async def pagina_login(request: Request):
    return templates.TemplateResponse(request=request, name="auth/login.html")


@app.get("/visualizacao", response_class=HTMLResponse)
async def pagina_visualizacao(request: Request, db: Session = Depends(get_db)):
    try:
        produtos_do_banco = db.query(Produto).all()
    except Exception:
        produtos_do_banco = []
    return templates.TemplateResponse(
        request=request, 
        name="public/visualizacao.html", 
        context={"produtos": produtos_do_banco}
    )


@app.post("/auth/login")
async def processar_login(
    email: str = Form(...), 
    senha: str = Form(...), 
    db: Session = Depends(get_db)
):
    try:
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        if usuario and pwd_context.verify(senha, usuario.senha):
            return JSONResponse(content={"status": "sucesso", "redirecionar": "/dashboard"})
    except Exception as e:
        print(f"❌ Erro na autenticação: {e}")
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="E-mail ou senha incorretos."
    )
@app.get("/auth/logout")
async def processar_logout():
    # Redireciona o usuário de volta para a vitrine pública inicial
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

# ─────────────────────────────────────────────────────────────────────────────
# ROTAS DO PAINEL ADMINISTRATIVO (VIEWS DE RENDERIZAÇÃO)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/dashboard", response_class=HTMLResponse)
async def pagina_dashboard(request: Request, db: Session = Depends(get_db)):
    """
    Rota principal do painel. Carrega o template de Visão Geral diretamente
    e alimenta todos os cards dinâmicos com dados reais do banco de dados.
    """
    total_produtos = 0
    total_categorias = 0
    total_fornecedores = 0
    vendas_formatadas = []
    total_vendas_valor = 0.0

    try:
        total_produtos = db.query(Produto).count()
        total_categorias = db.query(Categoria).count()
        total_fornecedores = db.query(Fornecedor).count()
        
        if Venda:
            vendas_do_banco = db.query(Venda).order_by(Venda.id.desc()).all()
            total_vendas_valor = sum(venda.preco_total for venda in vendas_do_banco)
            
            # Pega as 5 últimas vendas para alimentar a tabela de atividade/vendas recentes
            vendas_recentes = vendas_do_banco[:5]
            for v in vendas_recentes:
                prod = db.query(Produto).filter(Produto.id == v.produto_id).first()
                nome_produto = prod.nome if prod else "Produto Indisponível"
                
                vendas_formatadas.append({
                    "id": v.id,
                    "comprador": v.comprador,
                    "produto_nome": nome_produto,
                    "quantidade": v.quantidade,
                    "preco_total": v.preco_total,
                    "data_venda": v.data_venda
                })
    except Exception as e:
        print(f"⚠️ Alerta: Erro ao carregar Visão Geral: {e}")

    # Formatação do faturamento para o padrão de moeda brasileiro
    faturamento_pt_br = f"{total_vendas_valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    return templates.TemplateResponse(
        request=request,
        name="admin/visaogeral.html",  # Agora a rota mãe chama diretamente a visão geral!
        context={
            "total_produtos": total_produtos,
            "total_categorias": total_categorias,
            "total_fornecedores": total_fornecedores,
            "faturamento_total": faturamento_pt_br,
            "vendas_recentes": vendas_formatadas
        }
    )


@app.get("/dashboard/visaogeral")
async def redirecionar_visaogeral():
    """Redireciona para evitar caminhos duplicados desnecessários."""
    return RedirectResponse(url="/dashboard")


@app.get("/dashboard/produtos", response_class=HTMLResponse)
async def pagina_dashboard_produtos(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = []
    categorias_do_banco = []
    try:
        produtos_do_banco = db.query(Produto).all()
        categorias_do_banco = db.query(Categoria).all()  
    except Exception:
        pass

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
    categorias_do_banco = []
    categorias_serializadas = []
    try:
        categorias_do_banco = db.query(Categoria).all()
        categorias_serializadas = [{"id": cat.id, "nome": cat.nome} for cat in categorias_do_banco]
    except Exception:
        pass

    return templates.TemplateResponse(
        request=request,
        name="admin/categorias.html",
        context={
            "categories": categorias_do_banco,
            "categorias": categorias_do_banco,
            "categorias_json": categorias_serializadas
        }
    )


@app.get("/dashboard/fornecedores", response_class=HTMLResponse)
async def pagina_dashboard_fornecedores(request: Request, db: Session = Depends(get_db)):
    fornecedores_do_banco = []
    fornecedores_serializados = []
    try:
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
    except Exception:
        pass
    
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
    produtos_do_banco = []
    vendas_formatadas = []
    faturamento_calculado = 0.0
    
    try:
        produtos_do_banco = db.query(Produto).filter(Produto.disponivel == True).all()
        if Venda:
            vendas_do_banco = db.query(Venda).order_by(Venda.id.desc()).all()
            for v in vendas_do_banco:
                prod = db.query(Produto).filter(Produto.id == v.produto_id).first()
                nome_produto = prod.nome if prod else "Produto Indisponível"
                faturamento_calculado += v.preco_total
                
                vendas_formatadas.append({
                    "id": v.id,
                    "comprador": v.comprador,
                    "produto_nome": nome_produto,
                    "quantidade": v.quantidade,
                    "preco_total": v.preco_total,
                    "data_venda": v.data_venda
                })
    except Exception:
        pass
    
    return templates.TemplateResponse(
        request=request, 
        name="admin/vendas.html",
        context={
            "produtos": produtos_do_banco,
            "vendas": vendas_formatadas,
            "faturamento_total": f"{faturamento_calculado:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# API REST (ENDPOINTS CRUD ACESSADOS VIA AJAX/FETCH - PREFIXO /ADMIN)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/admin/assets/imagens")
async def listar_imagens_galeria():
    caminho_pasta = os.path.join(caminho_static_correto, "assets")
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
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
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
    if not fornecedor: 
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


# --- CRUD VENDAS ---

@app.post("/admin/vendas")
async def registrar_venda(dados: VendaSchema, db: Session = Depends(get_db)):
    if not Venda:
        raise HTTPException(status_code=501, detail="Módulo de vendas não está ativo no sistema.")

    produto = db.query(Produto).filter(Produto.id == dados.produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto vendido não encontrado no sistema.")

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


@app.delete("/admin/vendas/{venda_id}")
async def deletar_venda(venda_id: int, db: Session = Depends(get_db)):
    if not Venda:
        raise HTTPException(status_code=501, detail="Módulo de vendas não está ativo no sistema.")

    venda = db.query(Venda).filter(Venda.id == venda_id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada.")
        
    db.delete(venda)
    db.commit()
    return {"status": "deletado"}


@app.get("/admin/vendas/{venda_id}/extrato")
async def gerar_extrato_venda(venda_id: int, db: Session = Depends(get_db)):
    if not Venda:
        raise HTTPException(status_code=501, detail="Módulo de vendas não está ativo no sistema.")

    venda = db.query(Venda).filter(Venda.id == venda_id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada no banco.")
        
    prod = db.query(Produto).filter(Produto.id == venda.produto_id).first()
    
    return {
        "titulo": "COMPROVANTE DE VENDA - AAPM",
        "venda_id": venda.id,
        "comprador": venda.comprador,
        "produto": prod.nome if prod else "Produto Indisponível",
        "quantidade": venda.quantidade,
        "total_pago": venda.preco_total,
        "data": venda.data_venda.strftime("%d/%m/%Y %H:%M") if venda.data_venda else ""
    }