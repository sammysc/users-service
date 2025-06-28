# Users Service

Este microserviço gerencia usuários (alunos e professores) da plataforma educacional.

## Pré-requisitos

- [Docker](https://www.docker.com/get-started) e [Docker Compose](https://docs.docker.com/compose/)
- Node.js 18+ (apenas para execução local)
- Banco de dados PostgreSQL (usado via Docker)

## Executando com Docker

1. Certifique-se de que a rede Docker `plataforma-network` já existe:
   ```sh
   docker network create plataforma-network || true
   ```

2. Suba o serviço:
   ```sh
   docker-compose up --build
   ```

3. O serviço estará disponível em `http://localhost:3003`.

## Executando Localmente

1. Instale as dependências:
   ```sh
   npm install
   ```

2. Configure o banco de dados PostgreSQL (veja as credenciais em `config/config.json`).

3. Execute as migrações:
   ```sh
   npx sequelize-cli db:migrate
   ```

4. Inicie o serviço:
   ```sh
   npm start
   ```

5. O serviço estará disponível em `http://localhost:3003`.

## Endpoints

- `GET /teachers` - Lista professores
- `POST /teachers` - Cria professor
- `GET /students` - Lista alunos
- `POST /students` - Cria aluno

Consulte a documentação Swagger (em breve) para mais