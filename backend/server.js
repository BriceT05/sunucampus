require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/dashboard',   require('./src/routes/dashboard'));
app.use('/api/batiments',   require('./src/routes/batiments'));
app.use('/api/chambres',    require('./src/routes/chambres'));
app.use('/api/etudiants',   require('./src/routes/etudiants'));
app.use('/api/attributions',require('./src/routes/attributions'));
app.use('/api/paiements',   require('./src/routes/paiements'));
app.use('/api/incidents',   require('./src/routes/incidents'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'SunuCampus API opérationnelle', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🏛️  SunuCampus API démarrée → http://localhost:${PORT}\n`);
  });
}

module.exports = app;
