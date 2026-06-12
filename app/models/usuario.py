from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)  # Guarda o hash seguro
    role = Column(String(20), default="FUNCIONARIO")  # ADMIN ou FUNCIONARIO
    ativo = Column(Boolean, default=True)