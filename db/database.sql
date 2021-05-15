-- CREATE DATABASE socialmedia;
-- \c socialmedia

CREATE TABLE users (
    id serial not null primary key,
    username varchar(80) not null,
    password varchar(200) not null, 
    unique (username)
);

CREATE TABLE imageart (
    id smallserial not null primary key,
    username varchar(45) references users(username),
    image bytea not null,
    title varchar(50) not null, 
    author varchar(50) default 'anonymous',
    description text default 'no description',
    posting_date date default current_date
);

CREATE TABLE play (
    id smallserial not null primary key,
    username varchar(45) references users(username),
    game VARCHAR(15) CHECK (game = 'Jan-Ken-Pon' OR game = 'Monster-Killer') not null,
    result json not null,
    play_date date default current_date
);

CREATE TABLE profile (
    id smallserial not null primary key,
    username varchar(45) references users(username),
    fullname varchar(100),
    email varchar(100),
    phone varchar(50),
    age smallint,
    location varchar(70),
    artstyle varchar(20) check (artstyle = 'traditional' OR artstyle = 'non-traditional'),
    gender varchar(10) check (gender = 'female' OR gender = 'male' or gender = 'other'),
    bio text,
    avatar bytea
);