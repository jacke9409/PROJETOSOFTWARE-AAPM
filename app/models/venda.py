from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Venda(Base):
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, index=True)
    comprador = Column(String(255), nullable=False) # <--- CORRIGIDO: Agora com tamanho máximo para o MySQL aceitar
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Integer, nullable=False, default=1)
    preco_total = Column(Float, nullable=False, default=0.0)
    data_venda = Column(DateTime, default=datetime.utcnow)
    
    # Deixando opcional (nullable=True) para não bloquear seus testes iniciais
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    usuario = relationship("Usuario")