CREATE TABLE sessions (
    "user_id" SERIAL PRIMARY KEY REFERENCES users (id),
    "token" VARCHAR(200) UNIQUE,
    UNIQUE ("user_id", "token")
)
