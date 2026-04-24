import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookRoutes from './routes/cookRoutes.js';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.COOKS_PORT || 4002;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Cooks service connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'cooks' }));
app.use('/api/cooks', cookRoutes);

app.listen(PORT, () => console.log(`Cooks service running on http://localhost:${PORT}`));


mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Cooks service connected to MongoDB')
    const count = await mongoose.connection.db.collection('fooditems').countDocuments()
    console.log('Total fooditems in DB:', count)
  })
  .catch((err) => console.error('MongoDB connection error:', err));