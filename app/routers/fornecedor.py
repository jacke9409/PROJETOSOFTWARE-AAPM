from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/dashboard", tags=["Fornecedores"])
templates = Jinja2Templates(directory="app/templates")

@router.get("/fornecedores", response_class=HTMLResponse)
def exibir_fornecedores(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse("admin/fornecedores.html", {"request": request})