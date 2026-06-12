from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Fornecedor(Base):
    __tablename__ = "fornecedores"

    id = Column(Integer, primary_key=True, index=True)
    nome_empresa = Column(String(150), nullable=False, unique=True)
    cnpj = Column(String(18), nullable=True, unique=True)
    telefone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)

    # Caso queira ligar o fornecedor aos produtos futuramente:
    # produtos = relationship("Produto", back_populates="fornecedor")