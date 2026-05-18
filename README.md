# OR Scheduler (OctaCare)

OR Scheduler is a full-stack scheduling platform for hospital operating rooms. It combines a web UI, a Spring Boot API, a Python optimization service, and a PostgreSQL database, with real-time notifications powered by WebSockets and RabbitMQ.

## Architecture

- **Frontend**: Angular SPA with role-based routes and UI modules
- **Backend**: Spring Boot API with OAuth2/JWT, REST endpoints, and WebSocket gateway
- **Algorithm service**: FastAPI + OR-Tools CP-SAT scheduling engine
- **Database**: PostgreSQL with Flyway migrations and seed data
- **Messaging**: RabbitMQ STOMP relay for real-time notifications

## Services (Docker Compose)

- `database` (PostgreSQL 18)
- `or-scheduler-core` (Spring Boot)
- `or-scheduler-algorithm` (FastAPI)
- `or-scheduler-ui` (Angular, served via Nginx)
- `rabbitmq` (AMQP + management UI)

## Key features

- OAuth2 / JWT authentication with role-based access
- User management (admins, surgeons, nurses, patients)
- Operating room management and room status
- Surgery types and surgery CRUD
- Schedule generation with constraints and priorities
- Calendar view for schedules within a date range
- Surgeon availability management
- Sterilization logs for operating rooms
- Real-time notifications (global and user-specific)
- Reports endpoint for operational summary

## Scheduling engine

The Python service builds a constraint model using OR-Tools CP-SAT:

- **Hard constraints**: no overlapping rooms, no overlapping surgeon time, room type compatibility, surgeon availability
- **Soft goals**: prioritize emergency/urgent cases, minimize total completion time, avoid dropping surgeries

Results are returned to the backend and persisted as scheduled or pending surgeries.

## Tech stack

- **Frontend**: Angular 20, TypeScript, Playwright (E2E)
- **Backend**: Spring Boot 4, Java 21, Spring Security, Spring Data JPA, Flyway
- **Algorithm**: FastAPI, OR-Tools CP-SAT
- **Database**: PostgreSQL 18
- **Messaging**: RabbitMQ, STOMP over WebSocket
- **Build tools**: Maven, Docker, Docker Compose

## API surface (high level)

- `/api/auth/*` for authentication and session flows
- `/api/users` for user management and profile
- `/api/surgeries` for surgery CRUD and reschedule
- `/api/schedule` for calendar range queries and schedule generation
- `/api/rooms` for operating room CRUD
- `/api/surgery-types` for surgery type CRUD
- `/api/availability` for surgeon availability
- `/api/sterilization-logs` for sterilization tracking
- `/api/reports` for analytics summary
- `/api/ws-notifications` for WebSocket notifications

## Local setup

### 1) Environment variables

Set the following variables (or define them in a `.env` file for Docker Compose):

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_URL`
- `DB_USER`
- `DB_PASS`
- `UI_URL`

### 2) Start all services

```bash
docker compose up --build
```

- API: `http://localhost:8080`
- UI: `http://localhost`
- Algorithm: `http://localhost:8000`
- RabbitMQ UI: `http://localhost:15672`

## Frontend dev (Optional)

```bash
cd or-scheduler-ui
npm install
ng serve
```

Default dev URL: `http://localhost:4200`

## Backend dev (Optional)

```bash
cd or-scheduler-core
./mvnw spring-boot:run
```

## Algorithm dev (Optional)

```bash
cd or-scheduler-algorithm
pip install -r requirements.txt
python main.py
```

## Database migrations

Flyway runs automatically on backend startup. Migrations live in:

```
or-scheduler-core/src/main/resources/db/migration
```

## Testing

- Frontend unit tests: `ng test`
- Frontend E2E tests: `npm run e2e`
- Backend tests: `./mvnw test`

## Project structure

- `or-scheduler-ui/` Angular SPA
- `or-scheduler-core/` Spring Boot API
- `or-scheduler-algorithm/` FastAPI scheduling engine
- `rabbitmq/` RabbitMQ container setup
- `docker-compose.yml` Local multi-service orchestration

## Contributing

- Create a feature branch from `main`.
- Keep changes scoped to one feature or fix per branch.
- Update or add tests when behavior changes.
- Run the relevant test suites before opening a PR.

## Development notes

- The UI expects the API under `/api` (see `environment.ts`).
- The backend calls the algorithm service at `ALGORITHM_URL`.
- Schedule generation updates surgeries and pushes notifications.
- Use seed data from Flyway migrations for local testing.

## API examples

Generate a schedule for a date range:

```bash
curl -X POST "http://localhost:8080/api/schedule/generate?startDate=2026-05-10&endDate=2026-05-17"
```

Fetch scheduled surgeries for a calendar range:

```bash
curl "http://localhost:8080/api/schedule?start=2026-05-10T00:00:00&end=2026-05-17T23:59:59"
```

List operating rooms:

```bash
curl "http://localhost:8080/api/rooms"
```

## Notes

- The schedule generator can be triggered from the UI or via `POST /api/schedule/generate`.
- Real-time notifications are delivered over STOMP via RabbitMQ.
- Seed data is provided via Flyway migrations for local testing.