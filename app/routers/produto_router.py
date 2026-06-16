from fastapi import APIRouter, Request, Depends, HTTPException, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import json
from app.database import get_db
from app.models.produto import Produto
from app.models.categoria import Categoria
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/dashboard", tags=["Produtos"])
templates = Jinja2Templates(directory="app/routers/templates")

class ProdutoSchema(BaseModel):
    nome: str
    preco: float
    tamanho: str
    disponivel: Optional[int] = 1
    categoria_id: Optional[int] = None  
    imagem_url: Optional[str] = ""

# 1. ROTA GET - RENDERIZA A TELA DO ADMIN (Inclusão do argumento nomeado 'context=')
@router.get("/produtos", response_class=HTMLResponse)
async def pagina_dashboard_produtos(request: Request, db: Session = Depends(get_db)):
    produtos_do_banco = db.query(Produto).all()
    categorias_do_banco = db.query(Categoria).all()  
    
    produtos_mapeados = [
        {
            "id": p.id, 
            "nome": p.nome, 
            "preco": float(p.preco), 
            "tamanho": p.tamanho, 
            "disponivel": int(p.disponivel),
            "categoria_id": p.categoria_id, 
            "imagem_url": p.imagem_url if p.imagem_url else ""
        } for p in produtos_do_banco
    ]
    
    # A CORREÇÃO CRUCIAL ESTÁ AQUI: Adicionado 'context=' explicitamente antes das chaves
  # O segredo das versões novas do FastAPI: passar o request fora e dentro do context!
    return templates.TemplateResponse(
        request=request,
        name="admin/produtos.html",
        context={
            "request": request, 
            "produtos": produtos_do_banco, 
            "categorias": categorias_do_banco, 
            "produtos_json": json.dumps(produtos_mapeados)
        }
    )

# 2. ROTA POST - CRIA O PRODUTO 
@router.post("/produtos")
async def criar_produto(dados: ProdutoSchema, db: Session = Depends(get_db)):
    novo = Produto(**dados.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"status": "criado", "id": novo.id}

# 3. ROTA PUT - ATUALIZA O PRODUTO
@router.put("/produtos/{produto_id}")
async def atualizar_produto(produto_id: int, dados: ProdutoSchema, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto: 
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    for key, value in dados.dict().items():
        setattr(produto, key, value)
        
    db.commit()
    return {"status": "atualizado"}

# 4. ROTA DELETE - DELETA O PRODUTO
@router.delete("/produtos/{produto_id}")
async def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto: 
        raise HTTPException(status_code=404, detail="Produto não encontrado")
        
    db.delete(produto)
    db.commit()
    return {"status": "deletado"}