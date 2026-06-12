from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Venda(Base):
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, index=True)
    total = Column(Float, nullable=False, default=0.0)
    data_venda = Column(DateTime, default=datetime.utcnow)
    
    # Chave estrangeira que diz qual funcionário realizou a venda
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    usuario = relationship("Usuario")

# DICA EXTRA PARA O FUTURO:
# Sistemas de PDV profissionais geralmente têm uma tabela intermediária chamada 'ItemVenda' 
# para listar quais produtos e quantas unidades foram compradas em uma mesma venda.