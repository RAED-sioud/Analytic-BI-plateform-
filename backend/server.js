const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/business',    require('./routes/business'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/support',     require('./routes/support'));
app.use('/api/performance', require('./routes/performance'));

// Health check
app.get('/api/health', async (_, res) => {
  try {
    const db = require('./db');
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: e.message });
  }
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'build');
  app.use(express.static(buildPath));
  app.get('*', (_, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Analytic BI Plateform API → http://localhost:${PORT}`));
