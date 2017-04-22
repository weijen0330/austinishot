USE lynx;

DROP PROCEDURE IF EXISTS insert_link;

DELIMITER //
CREATE PROCEDURE insert_link (
	title VARCHAR(127), 
	description VARCHAR(255),
	url VARCHAR(2083)
)
	BEGIN
		INSERT INTO LINKS (title, description, url)
		VALUES (title, description, url);
	END
//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE populate_user_links (
	user_id INT,
	link_id INT
)
	BEGIN
		INSERT INTO USER_LINKS (user_id, link_id)
		VALUES (user_id, link_id);
	END
//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE populate_links_tags (
	link_id INT,
	tag_id INT
)
	BEGIN
		INSERT INTO LINKS_TAGS (link_id, tag_id)
		VALUES (link_id, tag_id);
	END
//
DELIMITER ;
/* DELIMITER //
CREATE PROCEDURE insert_message (	
	linkUrl VARCHAR(2083),
	senderEmail VARCHAR(127),
	recipientEmail VARCHAR(127),
	note VARCHAR(511)
)
	BEGIN
		DECLARE linkid INT;
		DECLARE senderId INT;
		DECLARE recipientId INT;

		SELECT id INTO linkid FROM link WHERE url = linkUrl LIMIT 1;
		SELECT id INTO senderId FROM user WHERE email = senderEmail LIMIT 1;
		SELECT id INTO recipientId FROM user WHERE email = recipientEmail LIMIT 1;

		INSERT INTO message (linkid, senderId, recipientId, note)
		VALUES (linkid, senderId, recipientId, note);
	END;
//
DELIMITER ;


DELIMITER //
CREATE PROCEDURE insert_mc (
	noteIn VARCHAR(511),
	categoryName VARCHAR(127)
)
	BEGIN
		DECLARE messageId INT;
		DECLARE categoryId INT;

		SELECT id INTO messageId FROM message WHERE note = noteIn LIMIT 1;
		SELECT id INTO categoryId FROM category WHERE name = categoryName LIMIT 1;

		INSERT INTO message_category (messageId, categoryId)		
		VALUES (messageId, categoryId);
	END;
//
DELIMITER ;


INSERT INTO domain (name) VALUES 
	('facebook'), 
	('reddit'), 
	('buzzfeed'), 
	('twitter'), 
	('yahoo');
*/

INSERT INTO TAGS (tag_text) VALUES 
	('funny'), 
	('science'), 
	('tech'), 
	('weird'), 
	('crazy'), 
	('math'), 
	('programming'), 
	('tips');


INSERT INTO USERS (first_name, last_name, email, passwordHash)
VALUES
									-- enamark
	('ena', 'mark', 'ena@gmail.com', '$2a$10$Gw4PvGXCE8cLy9OJHZpdYe97VsRAvujxEAeJGLCBzTo5Txgf25AUO'),
									-- alexburn
	('alex', 'burn', 'alex@gmail.com', '$2a$10$C1X3bAKWxB4lcjbiFKWvK.lZq6HvIzf8HZmZJOJaW8tOqclj2/Z3K'),
									-- amycool
	('amy', 'cool', 'amy@gmail.com', '$2a$10$t3leXbZZ7Scv.NpOdLsvVOCMyDixhFnVIBXjcPvnwPMT6MeYwKuCK'),
									-- jeffcool
	('jeff', 'cool', 'jeff@gmail.com', '$2a$10$rfTsiXqhZbTxFyudNuXGQ.6o8YaaaxE2qg5K7bXJi91H0vjHxtiWO'),
									-- davestearns
	('dave', 'stearns', 'stearns@gmail.com', '$2a$10$2TFIOXQh.XG/N4hxyJkXyuttrcWzcKoGvjVAtgsARdrG63FXU4BNm');


CALL insert_link (
	'Facebook', 
	'Social media site. Connect with old friends, new friends and complete strangers!',
	'www.facebook.com'
);
CALL insert_link (
	'Reddit',
	'The front page of the internet',
	'www.reddit.com'
);
CALL insert_link (
	'Buzzfeed',
	'Website that has mastered the art of distracting people',
	'www.buzzfeed.com'
);
CALL insert_link (
	'Twitter',
	'Share every moment of your life with people who care.',
	'www.twitter.com'
);
CALL insert_link (
	'Yahoo!',
	'Jack of all trades, master of none',
	'www.yahoo.com'
);

CALL populate_user_links (
	1,
	1
);

CALL populate_user_links (
	2,
	1
);

CALL populate_user_links (
	1,
	3
);

CALL populate_user_links (
	4,
	5
);

CALL populate_user_links (
	2,
	3
);

CALL populate_user_links (
	5,
	2
);
/*
CALL insert_message (
	'www.yahoo.com',
	'ena@gmail.com',
	'alex@gmail.com',
	'check this out, its pretty cool!'
);
CALL insert_message (
	'www.buzzfeed.com',
	'alex@gmail.com',
	'ena@gmail.com',
	'I saw your message, and i agree... it is cool. BUT you should actually check out buzzfeed'
);
CALL insert_message (
	'www.twitter.com',
	'amy@gmail.com',
	'jeff@gmail.com',
	'I thought you would appreciate this tweet!'
);
CALL insert_message (
	'www.twitter.com',
	'jeff@gmail.com',
	'amy@gmail.com',
	'haha that is pretty funny! check this one out'
);
CALL insert_message (
	'www.reddit.com',
	'stearns@gmail.com',
	'ena@gmail.com',
	'Become addicted to reddit please.'
);
CALL insert_message (
	'www.facebook.com',
	'ena@gmail.com',
	'stearns@gmail.com',
	'Become addicted to facebook please.'
);

CALL insert_mc (
	'check this out, its pretty cool!',
	'funny'
);
CALL insert_mc (
	'I saw your message, and i agree... it is cool. BUT you should actually check out buzzfeed',
	'funny'
);
CALL insert_mc (
	'I saw your message, and i agree... it is cool. BUT you should actually check out buzzfeed',
	'weird'
);
CALL insert_mc (
	'I saw your message, and i agree... it is cool. BUT you should actually check out buzzfeed',
	'science'
);
CALL insert_mc (
	'I thought you would appreciate this tweet!',
	'crazy'
);
CALL insert_mc (
	'I thought you would appreciate this tweet!',
	'funny'
);
CALL insert_mc (
	'haha that is pretty funny! check this one out',
	'funny'
);
CALL insert_mc (
	'haha that is pretty funny! check this one out',
	'tech'
);
CALL insert_mc (
	'Become addicted to reddit please.',
	'programming'	
);
CALL insert_mc (
	'Become addicted to reddit please.',
	'tips'
);
CALL insert_mc (
	'Become addicted to reddit please.',
	'math'
);
CALL insert_mc (
	'Become addicted to facebook please.',
	'funny'
);
CALL insert_mc (
	'Become addicted to facebook please.',
	'weird'
);
CALL insert_mc (
	'Become addicted to facebook please.',
	'crazy'
);
*/
