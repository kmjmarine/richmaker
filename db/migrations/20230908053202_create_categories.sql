-- migrate:up
CREATE TABLE categories (
	id INTEGER NOT NULL AUTO_INCREMENT,
	category_name VARCHAR(20) NOT NULL,
	image_url VARCHAR(500) NULL,
	PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE categories;