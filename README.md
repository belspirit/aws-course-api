# AWS API for the React Store

Based on the Rolling Scopes online course.

### Order to Deploy:

1. Auth Service
2. Product Service (Need to create RDS Database manually, using `/db` scripts)
3. Import Service
4. BFF Service

### Need to provide `.env` variablies for BFF Service:

```
NODE_ENV=production
product=https://XXXXXXX.execute-api.us-east-1.amazonaws.com
cart=https://YYYYYYY.execute-api.us-east-1.amazonaws.com/dev
import=https://ZZZZZZZ.execute-api.us-east-1.amazonaws.com/dev
```

### Also need to deploy:

1. Front End React Store App
2. Cart Service API
