# Auth

A simple auth middleware server.

# Usage

Local:

```bash
# Configure your env (optional)
cp .env.example .env
npm i
# Configure the app ./storage/db.json
npm start
# open localhost:3000
```

# Features

* Variable session storage: memory [for testing], redis, dynamodb
* Automatic AWS request signing if origin is part of the amazonaws.com domain.

### Example use case

* Authenticate using auth0 to access admin rethinkdb dashboard.
* Authenticate using auth0 to access AWS hosted elasticsearch and kibana
