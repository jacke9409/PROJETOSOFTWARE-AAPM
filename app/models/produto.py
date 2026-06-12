from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    tamanho = Column(String(50), nullable=True)
    preco = Column(Float, nullable=False)  # Preço para associados da AAPM
    disponivel = Column(Boolean, default=True)
    imagem_url = Column(String(255), nullable=True)  # Para o upload de imagens da Sprint 3
    
    # Chave estrangeira ligando o produto à sua categoria
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    
    categoria = relationship("Categoria", back_populates="produtos")