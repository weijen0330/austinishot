DROP DATABASE IF EXISTS lynx;
CREATE DATABASE lynx;
USE lynx;

CREATE TABLE USERS (
	user_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(128) NOT NULL,
	last_name VARCHAR(128) NOT NULL,
	email VARCHAR(128) NOT NULL,
	passwordHash VARCHAR(128) NOT NULL
);

CREATE TABLE TAGS (
	tag_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	tag_text VARCHAR(128) NOT NULL UNIQUE 
);

CREATE TABLE LINKS (
	link_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR (128),
	description VARCHAR(255),
	type VARCHAR(128) NOT NULL,
	domain_id INT NOT NULL REFERENCES DOMAIN(domain_id),
	url VARCHAR(2083) NOT NULL,
	img_url VARCHAR(2083)
);

CREATE TABLE PLATFORM (
	platform_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	platform_name VARCHAR(128)
);

CREATE TABLE DOMAIN (
	domain_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	domain_name VARCHAR (255) NOT NULL
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

CREATE TABLE USER_MESSAGES (
	user_id INT NOT NULL REFERENCES USERS(user_id),
	message_id INT NOT NULL REFERENCES MESSAGE(message_id),
	PRIMARY KEY (user_id, message_id)
);

CREATE TABLE USER_DOMAINS (
	user_id INT NOT NULL REFERENCES USERS(user_id),
	domain_id INT NOT NULL REFERENCES DOMAIN(domain_id),
	PRIMARY KEY (user_id, domain_id)
);

CREATE TABLE MESSAGE (
	message_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	link_id INT UNSIGNED NOT NULL REFERENCES LINKS(link_id),	
	sender VARCHAR (128) NOT NULL,
	recipient_id INT UNSIGNED NOT NULL REFERENCES USER(user_id),
	platform_id INT UNSIGNED NOT NULL REFERENCES PLATFORM(platform_id),
	note VARCHAR(500),
	timeSent VARCHAR(128),
	is_read BOOLEAN NOT NULL DEFAULT 0,
	deleted BOOLEAN NOT NULL DEFAULT 0
);

INSERT INTO PLATFORM VALUES (1, 'slack')
INSERT INTO PLATFORM VALUES (2, 'facebook')
INSERT INTO PLATFORM VALUES (3, 'gmail')
