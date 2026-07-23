import express from 'express';
import cors from 'cors';
import statsRouter from './routes/stats.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('🚀 B2B SaaS Backend API Çalışıyor!');
});

// Stats modülünü bağlıyoruz
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend sunucusu çalışıyor: http://localhost:${PORT}`);
});