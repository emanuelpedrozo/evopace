# EvoPace

Sistema web para planejamento, execução e acompanhamento de musculação e corrida com foco em performance híbrida.

## Escopo implementado

- Dashboard com volume de musculação, km semanais, pace, recovery score e aderência.
- Login e cadastro conectados à API com JWT salvo no navegador.
- Dashboard conectado ao endpoint real `/api/dashboard`.
- Cadastro de perfil com objetivo, nível, restrições, experiência, prontidão, sono, fadiga e dor.
- Avaliação física com peso, gordura, massa muscular, medidas, VO2, FC de repouso, linha do tempo e comparação visual.
- Musculação com divisões de treino, biblioteca de exercícios, registro de carga, conclusão de séries, RPE, descanso e sugestão de progressão.
- Corrida com tipos de treino, registro de distância, tempo, pace calculado, FC, cadência, elevação e esforço percebido.
- Módulo híbrido com regras para corrida + pernas, fadiga, deload, recuperação e overtraining.
- Periodização com macro, meso e microciclo.
- Social, gamificação, admin, planos, analytics e roadmap em estrutura inicial.

## Arquitetura atual

- Frontend: React + TypeScript + Vite.
- UI: CSS próprio e `lucide-react` para ícones.
- Backend: Express + TypeScript.
- Autenticação: JWT com senha criptografada por `bcryptjs`.
- ORM: Prisma.
- Persistência: PostgreSQL.
- Banco local: `docker-compose.yml`.

## API implementada

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `PATCH /api/profile`
- `GET /api/dashboard`
- CRUD de treinos: `/api/workouts`
- Execução de treino: `POST /api/workouts/:id/executions`
- CRUD de corridas: `/api/runs`
- CRUD de avaliações físicas: `/api/assessments`

## Próxima evolução técnica

1. Conectar CRUDs de treinos, corridas e avaliações aos formulários internos.
2. Adicionar refresh token, recuperação de senha e confirmação de email.
3. Criar gráficos reais e upload seguro de fotos.
4. Evoluir regra de progressão automática com histórico de execução.
5. Implementar integração com Garmin, Strava, Coros, Polar, Apple Health e Google Fit.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Rodando com banco local

1. Copie `.env.example` para `.env`.
2. Suba o PostgreSQL:

```bash
docker compose up -d
```

3. Gere o Prisma Client e rode as migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Popule a base de demonstração:

```bash
npm run db:seed
```

5. Inicie API e web em terminais separados:

```bash
npm run dev:api
npm run dev:web
```

Login demo:

```text
email: demo@evopace.app
senha: evopace123
```
