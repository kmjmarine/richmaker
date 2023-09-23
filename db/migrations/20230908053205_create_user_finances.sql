-- migrate:up
CREATE TABLE user_finances (
	id INTEGER NOT NULL AUTO_INCREMENT,
	user_id INTEGER NOT NULL,
	provider_id INTEGER NOT NULL,
	finance_number VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users (id),
	FOREIGN KEY (provider_id) REFERENCES providers (id)
);

-- migrate:down
DROP TABLE user_finances;