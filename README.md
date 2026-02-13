# valentinios

## Run locally

1. Start server:

```bash
npm start
```

2. Open site:

- Main page: `http://localhost:3000/`
- Admin panel: `http://localhost:3000/new`

## What `/new` shows

- visitor IP
- country / city / region (best effort by IP)
- device type
- browser and OS
- visited page path
- referrer
- screen and viewport size
- language and timezone

## Deploy on hosting

- Runtime: `Node.js 18+`
- Start command: `npm start`
- Port: from environment variable `PORT` (server already supports this)
- Health check (optional): `/healthz`

After deploy:
- Main page: `https://your-domain/`
- Admin panel: `https://your-domain/new`
