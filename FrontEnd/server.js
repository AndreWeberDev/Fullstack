const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');

const dbDir = path.join(__dirname, 'src', 'db');
const dbFile = path.join(dbDir, 'database.sqlite');
let db;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  const blockedPaths = ['/server.js', '/package.json', '/package-lock.json', '/.gitignore'];
  if (blockedPaths.includes(req.path) || req.path.startsWith('/node_modules')) {
    return res.status(404).end();
  }
  next();
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'img', 'favicon.ico'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

const gamesPath = path.join(__dirname, 'src', 'data', 'upcomingGames.json');

async function ensureDb() {
  try {
    await fs.mkdir(dbDir, { recursive: true });
    db = new sqlite3.Database(dbFile);

    await runSql(`CREATE TABLE IF NOT EXISTS upcomingGames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      link TEXT,
      img TEXT,
      subtitle TEXT
    );`);

    const grows = await allSql('SELECT COUNT(*) as c FROM upcomingGames');
    if (grows[0]?.c === 0) {
      const games = await readJSON(gamesPath);
      if (Array.isArray(games) && games.length > 0) {
        db.serialize(() => {
          const stmt = db.prepare('INSERT INTO upcomingGames (name,link,img,subtitle) VALUES (?,?,?,?)');
          games.forEach(g => {
            stmt.run(g.name || '', g.link || '', g.img || '', g.subtitle || '');
          });
          stmt.finalize(err => {
            if (err) console.error('Erro ao finalizar stmt de seed', err);
          });
        });
      } else {
        console.warn('Nenhum registro para seed em upcomingGames.json');
      }
    }
  } catch (e) {
    console.error('Erro init DB', e);
  }
}

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err); else resolve(this);
    });
  });
}

function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

async function readJSON(p) {
  try {
    const txt = await fs.readFile(p, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    console.error(`Falha ao ler JSON em ${p}:`, e);
    return [];
  }
}

async function writeJSON(p, data) {
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/upcomingGames', async (req, res) => {
  try {
    const rows = await allSql('SELECT id, name, link, img, subtitle FROM upcomingGames ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error('Erro ao consultar upcomingGames:', e);
    res.status(500).json({ error: 'Erro interno ao carregar jogos' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

ensureDb().then(() => {
  app.listen(PORT, () => console.log(`Servidor iniciado em http://localhost:${PORT}`));
}).catch(e => {
  console.error('Falha ao iniciar DB', e);
  process.exit(1);
});
