CREATE TABLE friends (
    "id" SERIAL PRIMARY KEY,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);
