# Docker Setup Implementation TODO

## Steps
- [x] 1. Inspect repository (package.json, backend, prisma, next.config, docker files, env)
- [x] 2. Create `.env.example` documenting required environment variables
- [x] 3. Update `.dockerignore` with build-excluded files
- [x] 4. Update `Dockerfile` (frontend) - remove `COPY app ./app`, multi-stage build on port 3000
- [x] 5. Create `Dockerfile.backend` - backend image on port 5000
- [x] 6. Replace `docker-compose.yml` - db/backend/frontend with healthchecks, no source volume
- [x] 7. Create `docker-compose.dev.yml` - dev variant with hot reload
- [x] 8. Validate: `docker compose config`
- [ ] 9. Build: `docker compose build --no-cache`
- [ ] 10. Start: `docker compose up` and verify frontend/backend/db
