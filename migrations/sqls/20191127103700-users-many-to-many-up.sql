CREATE TABLE friends (
    "userId" INTEGER NOT NULL REFERENCES users (id),
    "friendId" INTEGER NOT NULL REFERENCES users (id),
    PRIMARY KEY ("userId", "friendId")
);
