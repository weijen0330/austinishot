DROP DATABASE IF EXISTS lynx;
CREATE DATABASE lynx;
USE lynx;

CREATE TABLE USERS (
	user_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(35) NOT NULL,
	last_name VARCHAR(35) NOT NULL,
	email VARCHAR(35) NOT NULL,
	passwordHash VARCHAR(35) NOT NULL
);

CREATE TABLE USER_FRIENDS (
	user1_id INT NOT NULL REFERENCES USERS(user_id),
	user2_id INT NOT NULL REFERENCES USERS(user_id),
	startdate DATE,
	PRIMARY KEY(user1_id, user2_id)
);

CREATE TABLE TAGS (
	tag_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	tag_text VARCHAR(35) NOT NULL UNIQUE 
);

CREATE TABLE LINKS (
	link_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR (127),
	description VARCHAR(255),
	url VARCHAR(2083)
);

CREATE TABLE LINKS_TAGS (
	link_id INT NOT NULL REFERENCES LINKS(link_id),
	tag_id INT NOT NULL REFERENCES TAGS(tag_id),
	PRIMARY KEY(link_id, tag_id)
);

CREATE TABLE USER_TAGS (
	user_id INT NOT NULL REFERENCES USERS(user_id),
	tag_id INT NOT NULL REFERENCES TAGS(tag_id),
	PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE USER_LINKS (
	user_id INT NOT NULL REFERENCES USERS(user_id),
	link_id INT NOT NULL REFERENCES LINKS(link_id),
	PRIMARY KEY (user_id, link_id)
);