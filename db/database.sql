CREATE DATABASE socialmedia;

\c socialmedia

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(45) NOT NULL,
    password VARCHAR(45) NOT NULL, 
    UNIQUE (username)
);