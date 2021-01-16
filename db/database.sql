CREATE DATABASE socialmedia;

\c socialmedia

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    username CHARVAR(45) NOT NULL,
    password CHARVAR(45) NOT NULL, 
    UNIQUE (username)
);