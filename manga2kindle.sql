/**
 * This script works on all major sql servers, it was writed following the sql standard
 * Tested in: postgresql
 *
 * @author Eduardo Fernandez
 * @website https://edufdezsoy.es/
 */

DROP TABLE IF EXISTS status;
DROP TABLE IF EXISTS chapter;
DROP TABLE IF EXISTS manga;
DROP TABLE IF EXISTS language;
DROP TABLE IF EXISTS author;

CREATE TABLE IF NOT EXISTS author (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    surname VARCHAR(50),
    nickname VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS language (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5),
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS manga (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(45) UNIQUE,
    title VARCHAR(100),
    author_id INTEGER REFERENCES author(id)
);

CREATE TABLE IF NOT EXISTS chapter (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id),
    lang_id INTEGER REFERENCES language(id),
    chapter FLOAT,
    file_path VARCHAR(500),
    checksum VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapter(id),
    delivered SMALLINT,
    error SMALLINT,
    reason VARCHAR(250)
); 

------------------------------------- TEST DATA

INSERT INTO author (name, surname, nickname) VALUES
('', '', 'Aldehyde'),
('Yuuki', 'Obata', ''),
('Tatsumi', 'Kigi', ''),
('Aka', 'Akasaka', ''),
('Yusagi', 'Aneko', ''),
('', '', 'Katsuwo'),
('Nagisa', 'Fujita', ''),
('', '', '774 (Nanashi)'),
 ('', '', 'Namo');

INSERT INTO language (code, name) VALUES
('EN', 'English'),
('ES', 'Español');

INSERT INTO manga (uuid, title, author_id) VALUES
('urn:uuid:74357528-3935-2740-8282-624925322556', 'Neeko wa Tsurai yo', 1),
('urn:uuid:74357528-3935-2740-8282-624925305268', 'Bokura ga Ita series', 2),
('urn:uuid:74357528-3935-2740-8282-624925302374', 'Kyoumei Suru Echo', 3),
('urn:uuid:74357528-3935-2740-8282-624925308942', 'Kaguya-sama: Love is War', 4),
('urn:uuid:74357528-3935-2740-8282-624925308451', 'Tate no Yuusha no Nariagari', 5),
('urn:uuid:74357528-3935-2740-8282-624925308253', 'Hitoribocchi no OO Seikatsu', 6),
('urn:uuid:74357528-3935-2740-8282-624925308648', 'Do Chokkyuu Kareshi x Kanojo', 7),
('urn:uuid:74357528-3935-2740-8282-624925308494', 'Ijiranaide, Nagatoro-san', 8),
('urn:uuid:74357528-3935-2740-8282-624925314569', 'Ookami Shounen wa Kyou mo Uso wo Kasaneru', 9);