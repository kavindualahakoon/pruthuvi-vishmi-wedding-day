import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { GuestPhoto } from '../models/GuestPhoto';
import { readData, writeData } from '../utils/fileStorage';

const router = express.Router();
const PHOTOS_FILE = 'guestPhotos.json';

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../data/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'guest-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// GET all approved photos (for public gallery)
router.get('/approved', async (req, res) => {
  try {
    const photos = await readData<GuestPhoto[]>(PHOTOS_FILE, []);
    const approvedPhotos = photos.filter(p => p.approved);
    // Sort by createdAt descending
    approvedPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(approvedPhotos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved photos', error });
  }
});

// GET all photos (for admin dashboard)
router.get('/all', async (req, res) => {
  try {
    const photos = await readData<GuestPhoto[]>(PHOTOS_FILE, []);
    // Sort by createdAt descending
    photos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all photos', error });
  }
});

// POST upload a new photo (default unapproved)
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const uploaderName = req.body.uploaderName || 'Anonymous';
    const photoUrl = `/uploads/${req.file.filename}`;
    
    const photos = await readData<GuestPhoto[]>(PHOTOS_FILE, []);
    
    const newPhoto: GuestPhoto = {
      id: crypto.randomUUID(),
      url: photoUrl,
      originalName: req.file.originalname,
      uploaderName,
      approved: false,
      createdAt: new Date().toISOString()
    };
    
    photos.push(newPhoto);
    await writeData(PHOTOS_FILE, photos);
    
    res.status(201).json({ message: 'Photo uploaded successfully', photo: newPhoto });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ message: 'Error uploading photo', error: error.message || error });
  }
});

// PUT approve a photo (admin only)
router.put('/:id/approve', async (req, res) => {
  try {
    const photos = await readData<GuestPhoto[]>(PHOTOS_FILE, []);
    const photoIndex = photos.findIndex(p => p.id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    photos[photoIndex].approved = true;
    await writeData(PHOTOS_FILE, photos);
    
    res.json({ message: 'Photo approved successfully', photo: photos[photoIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Error approving photo', error });
  }
});

// DELETE a photo (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const photos = await readData<GuestPhoto[]>(PHOTOS_FILE, []);
    const photoIndex = photos.findIndex(p => p.id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    const photo = photos[photoIndex];
    
    // Optional: Delete the actual file
    const filePath = path.join(__dirname, '../../data', photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    photos.splice(photoIndex, 1);
    await writeData(PHOTOS_FILE, photos);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting photo', error });
  }
});

export default router;
