# Auth

A simple auth middleware server.

# Usage

```bash
# Configure your env
cp .env.example .env
npm i
DEBUG=app npm start
# open localhost:3000
```

### Example use case

Authenticate using auth0 to access admin rethinkdb dashboard.

```bash
DOMAIN=blah.auth0.com
CLIENT_ID=blah
CLIENT_SECRET=blahblah
CALLBACK_URL=http://localhost:3000/callback
ORIGIN=http://rethinkdb.host.io:8080
SECRET=blahblahblah
SUCCESS_RETURN_TO="/"
AUTH_STRATEGY=auth0

# Options: memory [default], redis
SESSION_DRIVER=redis

REDIS_HOST=localhost

```



