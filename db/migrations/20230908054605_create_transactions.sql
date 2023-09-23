-- migrate:up
CREATE TABLE transactions (
	id INTEGER NOT NULL AUTO_INCREMENT,
	user_finances_id INTEGER NOT NULL,
	amount DECIMAL(10,2) NOT NULL,
	transaction_note VARCHAR(50) NOT NULL,
	category_id INTEGER NOT NULL,
	is_monthly TINYINT NOT NULL DEFAULT 0, 
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
	FOREIGN KEY (user_finances_id) REFERENCES user_finances (id),
	FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- migrate:down
DROP TABLE transactions;