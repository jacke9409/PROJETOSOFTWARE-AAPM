import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Forçamos a string de conexão correta com a senha 'root' que você alterou no Workbench
DATABASE_URL = "mysql+pymysql://root:root@localhost:3307/aapm"

# Configura o motor de conexão para o MySQL
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True  # Verifica se a conexão está ativa antes de usá-la
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