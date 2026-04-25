# Issue Dashboard

Basic Angular 21 frontend for the Spring Boot `IssueController` API.

## Environment config

- Local `.env` points to `http://localhost:8069`
- Production `.env.production` is a placeholder for your future domain

Angular itself reads from `src/environments/environment.ts` and `src/environments/environment.prod.ts`, which mirror those `.env` values.

## API endpoints wired

- `GET {API_BASE_URL}/api/issue/list`
- `POST {API_BASE_URL}/api/issue/create`
- `GET {API_BASE_URL}/api/issue/get/{id}?id={id}`
- `POST {API_BASE_URL}/api/issue/delete/{id}?id={id}`

The `get` and `delete` methods send both the path segment and query parameter because the provided Spring controller maps `/{id}` but reads `@RequestParam String id`.

## Run

1. Install dependencies: `npm install`
2. Start Angular: `npm start`
3. Open `http://localhost:4200`

If you want to change hosts later, update the `.env` files and keep the Angular environment files in sync.
