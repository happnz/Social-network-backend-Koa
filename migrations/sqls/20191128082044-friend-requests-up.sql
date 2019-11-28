CREATE TABLE "friendRequests" (
    "toId" INTEGER NOT NULL REFERENCES users (id),
    "fromId" INTEGER NOT NULL REFERENCES users (id),
    PRIMARY KEY ("toId", "fromId")
)
