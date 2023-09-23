-- migrate:up
CREATE TABLE invitations (
	id INTEGER NOT NULL AUTO_INCREMENT,
	inviter_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	status CHAR(1) NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
	FOREIGN KEY (inviter_id) REFERENCES users (id)
);

-- migrate:down
DROP TABLE invitations;