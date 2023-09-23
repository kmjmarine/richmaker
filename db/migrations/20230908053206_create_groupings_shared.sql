-- migrate:up
CREATE TABLE groupings_shared (
	id INTEGER NOT NULL AUTO_INCREMENT,
	grouping_id INTEGER NOT NULL,
	provider_name VARCHAR(30) NOT NULL,
	finance_number VARCHAR(50) NOT NULL,
	type CHAR(1) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
	FOREIGN KEY (grouping_id) REFERENCES groupings (id)
);

-- migrate:down
DROP TABLE groupings_shared;