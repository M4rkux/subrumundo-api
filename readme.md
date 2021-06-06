# Subrumundo API

## Project setup
```
yarn install
```

## Run the database
```bash
docker-compose -f docker/mongo.yml up -d
```

## Compiles for development
```
yarn dev
```

## Run unit tests
```
yarn test
```

## Stack
### This project is using:
 - TypeScript
 - Express
 - MongoDB (inside docker)
 - Jest