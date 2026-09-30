CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
) DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE (team_id, name),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4;

INSERT IGNORE INTO teams (id, name) VALUES (1, '(Ď)Edové');
INSERT IGNORE INTO members (team_id, name) VALUES
    (1, 'Jakub Skramuský'),
    (1, 'Kristián Pěnička'),
    (1, 'Miroslav Štecha');

CREATE TABLE IF NOT EXISTS stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    is_transfer BOOLEAN NOT NULL DEFAULT FALSE,
    x DECIMAL(10, 2) NOT NULL,
    y DECIMAL(10, 2) NOT NULL,
    wheelchair_accessible BOOLEAN NOT NULL DEFAULT FALSE,
    has_shelter BOOLEAN NOT NULL DEFAULT FALSE,
    has_bench BOOLEAN NOT NULL DEFAULT FALSE,
    has_ticket_machine BOOLEAN NOT NULL DEFAULT FALSE,
    has_display BOOLEAN NOT NULL DEFAULT FALSE
) DEFAULT CHARSET = utf8mb4;