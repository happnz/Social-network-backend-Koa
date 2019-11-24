CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);
