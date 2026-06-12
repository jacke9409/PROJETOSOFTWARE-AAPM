from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db  # Ajuste o caminho de onde puxa seu banco de dados
from app.models.usuario import Usuario  # Ajuste o caminho do seu model de Usuário
# Se você tiver uma função de checar senha (ex: pwd_context.verify), importe-a aqui

templates = Jinja2Templates(directory="app/routers/templates")
router = APIRouter(prefix="/auth")

@router.post("/login", response_class=HTMLResponse)
async def login(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    
    # 1. Busca o usuário administrativo no banco pelo e-mail
    usuario = db.query(Usuario).filter(Usuario.email == username).first()
    
    # 2. Se o usuário existir (Para fins de teste, comparando texto limpo ou sua função hash)
    if usuario and usuario.senha == password:  # Se usar hash, mude para: verificar_senha(password, usuario.senha)
        
        # 🟢 LOGIN CONFIRMADO: Renderiza o dashboard real do admin!
        return templates.TemplateResponse("admin/dashboard.html", {"request": request, "usuario": usuario})
    
    # 🔴 Se falhar, joga o erro para o JavaScript capturar
    return HTMLResponse(content="Credenciais incorretas", status_code=401)