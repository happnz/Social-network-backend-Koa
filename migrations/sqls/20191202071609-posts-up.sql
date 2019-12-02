CREATE TABLE "posts" (
    "id" SERIAL PRIMARY KEY,
    "text" VARCHAR(2048) NOT NULL,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "userId" INTEGER REFERENCES "users" ("id")
);
