Iniciar o servidor com recarregamento automático (Uvicorn):

Bash
 uvicorn main:app --reload
Parar o servidor que está rodando:

Pressione Ctrl + C dentro do terminal.

📦 Instalação de Dependências e Bibliotecas
Instalar todas as bibliotecas necessárias de uma vez:

Bash
pip install fastapi uvicorn jinja2 watchfiles
Salvar as bibliotecas instaladas no arquivo requirements (gerar o arquivo):

Bash
pip freeze > requirements.txt
Instalar as dependências a partir do arquivo requirements existente:

Bash
pip install -r requirements.txt

Verificar em qual branch você está e o status dos arquivos:

Bash
git status
Atualizar sua branch local trazendo as novidades do servidor (Pull):

Bash
git pull origin jackelyne
Adicionar todas as alterações de código para o envio:

Bash
git add .

git commit -m '' 
para subir o codigo

Enviar as suas alterações para o GitHub (Push):

Bash
git push origin

Rodar o script para popular o banco de dados (Seed):

Bash
python seed.py
python -m uvicorn main:app --reload