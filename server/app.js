require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(require('passport').initialize());


// ── Health check (mirrors OVP's /health route) ────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'SevaLink API', time: new Date() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',                  require('./routes/auth'));
app.use('/api/volunteers',            require('./routes/volunteers'));
app.use('/api/recipients',            require('./routes/recipients'));
app.use('/api/actions',               require('./routes/actions'));
app.use('/api/distribution-centres',  require('./routes/distributionCentres'));
app.use('/api/products',              require('./routes/products'));
app.use('/api/matchmaking',           require('./routes/matchmaking'));
app.use('/api/surveys',               require('./routes/surveys'));
app.use('/api/reports',               require('./routes/reports'));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ msg: err.message || 'Internal Server Error' });
});

// ── Database + Server start ───────────────────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected →', config.mongoUri);

    app.listen(config.port, () => {
      console.log(`
    ╔══════════════════════════════════════════════════╗
    ║        🌐  SevaLink API Server Running           ║
    ║  http://localhost:${config.port}                         ║
    ║  Health: http://localhost:${config.port}/health          ║
    ╚══════════════════════════════════════════════════╝`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  process.exit(1);
});
