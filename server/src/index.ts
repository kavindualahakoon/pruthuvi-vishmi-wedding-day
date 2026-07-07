import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static uploads from the data folder
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

// Basic routes
app.get('/', (req, res) => {
  res.send('Wedding API Server is running. Please open the frontend application (usually on port 3000) to view the website.');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wedding Server is running' });
});

import rsvpRoutes from './routes/rsvp';
import messageRoutes from './routes/messages';
import contentRoutes from './routes/content';
import guestPhotosRoutes from './routes/guestPhotos';

app.use('/api/rsvp', rsvpRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/guest-photos', guestPhotosRoutes);

// Database connection and initialization has been replaced by file storage

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Data will be stored in local JSON files in the server/data directory.`);
});
