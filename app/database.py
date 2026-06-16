import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
# Linha 9:
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@127.0.0.1:3306/aapm"

# Configura o motor de conexão para o MySQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,  # <--- Mude de DATABASE_URL para SQLALCHEMY_DATABASE_URL
    pool_pre_ping=True
)

# Cria a fábrica de sessões com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base que todos os seus modelos vão herdar
Base = declarative_base()

# Dependência que o FastAPI vai usar nas rotas para abrir e fechar a conexão
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()