require('dotenv').config();
const express = require('express');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8060);

const app = express();
app.use(express.json());

// Хранилище в памяти: после перезапуска сервиса расписание пустое.
const talks = new Map();
let nextId = 1;

const findTalk = (req, res) => {
  const id = Number(req.params.id);
  const talk = Number.isInteger(id) ? talks.get(id) : undefined;
  if (!talk) {
    res.status(404).json({ error: 'Talk not found' });
    return null;
  }
  return talk;
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/v1/talks', (req, res) => {
  const { title, speaker, room = null, confirmed = false } = req.body;
  if (!isNonEmptyString(title) || !isNonEmptyString(speaker)) {
    return res.status(400).json({ error: 'title and speaker are required' });
  }
  const talk = { id: nextId++, title: title.trim(), speaker: speaker.trim(), room, confirmed: Boolean(confirmed) };
  talks.set(talk.id, talk);
  res.status(201).json(talk);
});

app.get('/api/v1/talks', (req, res) => {
  let result = [...talks.values()];
  if (req.query.room) {
    result = result.filter((t) => t.room === req.query.room);
  }
  if (req.query.confirmed !== undefined) {
    result = result.filter((t) => String(t.confirmed) === req.query.confirmed);
  }
  res.json(result);
});

app.get('/api/v1/talks/:id', (req, res) => {
  const talk = findTalk(req, res);
  if (talk) res.json(talk);
});

app.patch('/api/v1/talks/:id', (req, res) => {
  const talk = findTalk(req, res);
  if (!talk) return;
  for (const field of ['title', 'speaker', 'room', 'confirmed']) {
    if (req.body[field] !== undefined) {
      talk[field] = req.body[field];
    }
  }
  res.json(talk);
});

app.delete('/api/v1/talks/:id', (req, res) => {
  const talk = findTalk(req, res);
  if (!talk) return;
  talks.delete(talk.id);
  res.status(204).send();
});

const server = app.listen(PORT, HOST, () => {
  console.log(`conference-talks-api listening on http://${HOST}:${PORT}`);
});

// Корректная остановка по сигналу от systemd.
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
