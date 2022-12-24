/**
 * SQL ONLY, DONT DO SHIT HERE
 */

const sqlite3 = require("sqlite3");
var db;

// #region init database methods

function openDatabase() {
  db = new sqlite3.Database(
    "./manga2kindle.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
      } else if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
    }
  );
}

function createDatabase() {
  var newdb = new sqlite3.Database("./manga2kindle.db", (err) => {
    if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    createTables(newdb);
  });
}

function createTables(newdb) {
  newdb.exec(
    `
  CREATE TABLE author (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    nickname TEXT
  );

  CREATE TABLE language (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE manga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE,
    title TEXT NOT NULL,
    author_id INTEGER,
    FOREIGN KEY(author_id) REFERENCES author(id)
  );

  CREATE TABLE chapter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manga_id INTEGER NOT NULL,
    lang_id INTEGER,
    volume INTEGER,
    chapter INTEGER,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mail TEXT NOT NULL,
    FOREIGN KEY(manga_id) REFERENCES manga(id),
    FOREIGN KEY(lang_id) REFERENCES language(id)
  );

  CREATE TABLE status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL,
    delivered INTEGER NOT NULL,
    error INTEGER,
    reason TEXT,
    FOREIGN KEY(chapter_id) REFERENCES chapter(id)
  );

  INSERT INTO author (name, surname, nickname)
  VALUES  ('', '', 'Aldehyde'),
          ('Yuuki', 'Obata', ''),
          ('Tatsumi', 'Kigi', ''),
          ('Aka', 'Akasaka', ''),
          ('Yusagi', 'Aneko', ''),
          ('', '', 'Katsuwo'),
          ('Nagisa', 'Fujita', ''),
          ('', '', '774 (Nanashi)'),
          ('', '', 'Namo'),
          ('Yamamoto', 'Souichirou', 'Kijouyu Udon');

  INSERT INTO language (code, name)
  VALUES  ('EN', 'English'),
          ('ES', 'Español');

  INSERT INTO manga (uuid, title, author_id) 
  VALUES  ('urn:uuid:74357528-3935-2740-8282-624925322556', 'Neeko wa Tsurai yo', 1),
          ('urn:uuid:74357528-3935-2740-8282-624925305268', 'Bokura ga Ita series', 2),
          ('urn:uuid:74357528-3935-2740-8282-624925302374', 'Kyoumei Suru Echo', 3),
          ('urn:uuid:74357528-3935-2740-8282-624925308942', 'Kaguya-sama: Love is War', 4),
          ('urn:uuid:74357528-3935-2740-8282-624925308451', 'Tate no Yuusha no Nariagari', 5),
          ('urn:uuid:74357528-3935-2740-8282-624925308253', 'Hitoribocchi no OO Seikatsu', 6),
          ('urn:uuid:74357528-3935-2740-8282-624925308648', 'Do Chokkyuu Kareshi x Kanojo', 7),
          ('urn:uuid:74357528-3935-2740-8282-624925308494', 'Ijiranaide, Nagatoro-san', 8),
          ('urn:uuid:74357528-3935-2740-8282-624925314569', 'Ookami Shounen wa Kyou mo Uso wo Kasaneru', 9),
          ('urn:uuid:74357528-3935-2740-8282-624925313108', 'Karakai Jouzu no Takagi-san', 10);
      `,
    () => {
      db = newdb;
    }
  );
}

// #endregion

// #region manga methods

exports.getManga = (id) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.get(
      "SELECT id, title, uuid, author_id FROM manga WHERE id = ?",
      [id],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.getMangas = (limit = 100) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.get(
      "SELECT id, title, uuid, author_id FROM manga LIMIT ?",
      [limit],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.searchManga = (search) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    search = "%" + search + "%";

    db.all(
      "SELECT id, title, uuid, author_id FROM manga WHERE UPPER(title) LIKE UPPER(?) LIMIT 100",
      [search],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.addManga = (title, uuid, authorId) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.run(
      "INSERT INTO manga(title, uuid, author_id) VALUES (?, ?, ?) RETURNING id, title, uuid, author_id",
      [title, uuid, authorId],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

// #endregion

// #region author methods

exports.getAuthors = (limit) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.get(
      "SELECT id, name, surname, nickname FROM author LIMIT ?",
      [limit],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.getAuthor = (id) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.all(
      "SELECT id, name, surname, nickname FROM author WHERE id = ? LIMIT 100",
      [id],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.searchAuthor = (search) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    search = "%" + search + "%";

    db.all(
      "SELECT id, name, surname, nickname FROM author WHERE " +
        "UPPER(name) LIKE UPPER(?) OR " +
        "UPPER(surname) LIKE UPPER(?) OR " +
        "UPPER(nickname) LIKE UPPER(?) " +
        "LIMIT 100",
      [search],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.addAuthor = (name, surname, nickname) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.run(
      "INSERT INTO author(name, surname, nickname) VALUES (?, ?, ?) RETURNING id, name, surname, nickname",
      [name, surname, nickname],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

// #endregion

// #region chapters methods

exports.putChapter = (mangaId, langId, title, volume, chapter, route, mail) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.get(
      "INSERT INTO chapter(manga_id, lang_id, volume, chapter, title, file_path, mail) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id, manga_id, lang_id, volume, chapter, title",
      [mangaId, langId, volume, chapter, title, route, mail],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

// #endregion

// #region status methods

exports.getStatus = (chapter) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.get(
      "SELECT chapter_id, delivered, error, reason FROM status WHERE chapter_id = ?",
      [chapter],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.setStatus = (chapter, delivered, error, reason) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.run(
      "INSERT INTO status(chapter_id, delivered, error, reason) VALUES (?, ?, ?, ?)",
      [chapter, delivered, error, reason],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

exports.editStatus = (chapter, delivered, error, reason) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.run(
      "UPDATE status SET delivered = ?, error = ?, reason = ? WHERE chapter_id = ?",
      [delivered, error, reason, chapter],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

// #endregion

// #region utils

exports.uuidExists = (uuid) => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.get("SELECT COUNT(1) FROM manga WHERE uuid = ?", [uuid], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

exports.getLanguages = () => {
  return new Promise((resolve, reject) => {
    if (db == null) {
      openDatabase();
    }

    db.all("SELECT * FROM language", (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

// #endregion
