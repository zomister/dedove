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
