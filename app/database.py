import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Descobre a pasta raiz do projeto de forma dinâmica e aponta para o .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
# ... (o resto do código do seu database.py continua igual abaixo)
if not DATABASE_URL:
    raise ValueError("A variável DATABASE_URL não foi definida no arquivo .env")

# Configura o motor de conexão para o MySQL
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True  # Verifica se a conexão está ativa antes de usá-la
)

# Cria a fábrica de sessões com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base que todos os seus modelos (usuario, produto, etc.) vão herdar
Base = declarative_base()

# Dependência que o FastAPI vai usar nas rotas para abrir e fechar a conexão
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()