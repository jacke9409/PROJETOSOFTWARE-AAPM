from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.categoria import Categoria
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["Categorias"])
templates = Jinja2Templates(directory="app/routers/templates")

class CategoriaSchema(BaseModel):
    nome: str

@router.get("/categorias", response_class=HTMLResponse)
async def pagina_dashboard_categorias(request: Request, db: Session = Depends(get_db)):
    categorias_do_banco = db.query(Categoria).all()
    categorias_serializadas = [{"id": cat.id, "nome": cat.nome} for cat in categorias_do_banco]
    return templates.TemplateResponse(
        "admin/categorias.html",
        {"request": request, "categorias": categorias_do_banco, "categorias_json": categorias_serializadas}
    )

@router.post("/categorias")
async def criar_categoria(dados: CategoriaSchema, db: Session = Depends(get_db)):
    nova = Categoria(nome=dados.nome)
    db.add(nova)
    db.commit()
    return {"status": "criado", "id": nova.id}