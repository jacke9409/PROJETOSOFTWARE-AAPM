from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/dashboard", tags=["Vendas"])
templates = Jinja2Templates(directory="app/templates")

@router.get("/vendas", response_class=HTMLResponse)
def exibir_vendas(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse("admin/vendas.html", {"request": request})