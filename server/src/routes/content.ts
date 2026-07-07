import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Content } from '../models/Content';
import { readData, writeData } from '../utils/fileStorage';

const router = express.Router();
const CONTENT_FILE = 'content.json';

const defaultHero = {
  brideName: "",
  groomName: "",
  weddingDate: "",
  countdownTarget: "",
  bgUrl: ""
};

const defaultOurStory = {
  events: []
};

const defaultPreShoot = {
  title: "",
  description: "",
  videoUrl: ""
};

const defaultWeddingEvents: any[] = [];

const defaultGallery: any[] = [];

const defaultWeddingCard = {
  imageUrl: ""
};

const defaultVisibility = {
  hero: true,
  countdown: true,
  weddingCard: true,
  ourStory: true,
  preShootVideo: true,
  events: true,
  gallery: true,
  rsvpForm: true,
  guestPhotos: true
};

const initialDefaultContent: Content = {
  hero: { en: defaultHero, si: defaultHero, ta: defaultHero },
  ourStory: { en: defaultOurStory, si: defaultOurStory, ta: defaultOurStory },
  preShoot: { en: defaultPreShoot, si: defaultPreShoot, ta: defaultPreShoot },
  weddingEvents: { en: defaultWeddingEvents, si: defaultWeddingEvents, ta: defaultWeddingEvents },
  gallery: defaultGallery,
  weddingCard: defaultWeddingCard,
  visibility: defaultVisibility
};

const isLocalized = (obj: any) => obj && obj.en !== undefined;

async function migrateContentIfNecessary(contentData: Content) {
  let needsUpdate = false;
  const newContent = { ...contentData };
  
  if (!newContent.gallery) {
    newContent.gallery = defaultGallery;
    needsUpdate = true;
  }
  
  if (!newContent.weddingCard) {
    newContent.weddingCard = defaultWeddingCard;
    needsUpdate = true;
  }
  
  if (!newContent.visibility) {
    newContent.visibility = defaultVisibility;
    needsUpdate = true;
  }
  
  if (newContent.hero && !isLocalized(newContent.hero)) {
    newContent.hero = { en: newContent.hero, si: newContent.hero, ta: newContent.hero };
    needsUpdate = true;
  }
  if (newContent.ourStory && !isLocalized(newContent.ourStory)) {
    newContent.ourStory = { en: newContent.ourStory, si: newContent.ourStory, ta: newContent.ourStory };
    needsUpdate = true;
  }
  if (newContent.preShoot && !isLocalized(newContent.preShoot)) {
    newContent.preShoot = { en: newContent.preShoot, si: newContent.preShoot, ta: newContent.preShoot };
    needsUpdate = true;
  }
  if (newContent.weddingEvents && !isLocalized(newContent.weddingEvents)) {
    newContent.weddingEvents = { en: newContent.weddingEvents, si: newContent.weddingEvents, ta: newContent.weddingEvents };
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    await writeData(CONTENT_FILE, newContent);
  }
  return newContent;
}

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
    cb(null, 'preshoot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } 
});

// GET content
router.get('/', async (req, res) => {
  try {
    let content = await readData<Content | null>(CONTENT_FILE, null);
    if (!content) {
      content = initialDefaultContent;
      await writeData(CONTENT_FILE, content);
    } else {
      content = await migrateContentIfNecessary(content);
    }
    res.json(content);
  } catch (error: any) {
    console.warn("File read failed, returning fallback content:", error.message || error);
    res.json(initialDefaultContent);
  }
});

// Helper to map nested visibility properly
const mapVisibilityToNested = (body: any): Content => {
  const data = { ...body };
  if (data.visibilityHero !== undefined) {
    data.visibility = {
      hero: data.visibilityHero,
      countdown: data.visibilityCountdown ?? true,
      weddingCard: data.visibilityWeddingCard ?? true,
      ourStory: data.visibilityOurStory ?? true,
      preShootVideo: data.visibilityPreShootVideo ?? true,
      events: data.visibilityEvents ?? true,
      gallery: data.visibilityGallery ?? true,
      rsvpForm: data.visibilityRsvpForm ?? true,
      guestPhotos: data.visibilityGuestPhotos ?? true
    };
    delete data.visibilityHero;
    delete data.visibilityCountdown;
    delete data.visibilityWeddingCard;
    delete data.visibilityOurStory;
    delete data.visibilityPreShootVideo;
    delete data.visibilityEvents;
    delete data.visibilityGallery;
    delete data.visibilityRsvpForm;
    delete data.visibilityGuestPhotos;
  } else if (!data.visibility) {
    data.visibility = defaultVisibility;
  }
  return data as Content;
};

// PUT (Update) content
router.put('/', async (req, res) => {
  try {
    const dataToSave = mapVisibilityToNested(req.body);
    let content = await readData<Content | null>(CONTENT_FILE, null);
    if (!content) {
      await writeData(CONTENT_FILE, dataToSave);
      content = dataToSave;
    } else {
      content = { ...content, ...dataToSave };
      await writeData(CONTENT_FILE, content);
    }
    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    console.warn('File update failed:', error);
    res.status(500).json({ message: 'Error updating content', error });
  }
});

// POST Upload video
router.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const videoUrl = `/uploads/${req.file.filename}`;
    
    let content = await readData<Content | null>(CONTENT_FILE, null);
    if (content) {
      const migrated = await migrateContentIfNecessary(content);
      migrated.preShoot = {
        en: { ...migrated.preShoot.en, videoUrl },
        si: { ...migrated.preShoot.si, videoUrl },
        ta: { ...migrated.preShoot.ta, videoUrl }
      };
      await writeData(CONTENT_FILE, migrated);
    } else {
      const newContent = JSON.parse(JSON.stringify(initialDefaultContent));
      newContent.preShoot.en.videoUrl = videoUrl;
      newContent.preShoot.si.videoUrl = videoUrl;
      newContent.preShoot.ta.videoUrl = videoUrl;
      await writeData(CONTENT_FILE, newContent);
    }
    
    res.json({ message: 'Video uploaded successfully', videoUrl });
  } catch (error) {
    console.warn("Upload update failed:", error);
    if (req.file) {
       const videoUrl = `/uploads/${req.file.filename}`;
       return res.json({ message: 'Video uploaded locally but could not save to content.json', videoUrl });
    }
    res.status(500).json({ message: 'Error uploading video', error });
  }
});

// POST Upload image for gallery
router.post('/upload-image', upload.single('image'), async (req, res) => {
  console.log('Received upload-image request', req.headers['content-type']);
  try {
    if (!req.file) {
      console.log('No file uploaded in req.file');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file.filename);
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error: any) {
    console.error("Upload image catch block error:", error.message || error);
    res.status(500).json({ message: 'Error uploading image', error: error.message || error });
  }
});

// POST Upload audio
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }
    
    const audioUrl = `/uploads/${req.file.filename}`;
    
    let content = await readData<Content | null>(CONTENT_FILE, null);
    if (content) {
      const migrated = await migrateContentIfNecessary(content);
      migrated.hero = {
        en: { ...migrated.hero.en, audioUrl },
        si: { ...migrated.hero.si, audioUrl },
        ta: { ...migrated.hero.ta, audioUrl }
      };
      await writeData(CONTENT_FILE, migrated);
    }
    
    res.json({ message: 'Audio uploaded successfully', audioUrl });
  } catch (error) {
    console.warn("Upload update failed:", error);
    if (req.file) {
       const audioUrl = `/uploads/${req.file.filename}`;
       return res.json({ message: 'Audio uploaded locally but could not save to content.json', audioUrl });
    }
    res.status(500).json({ message: 'Error uploading audio', error });
  }
});

// Add error handling middleware for Multer errors
router.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError || err) {
    console.error("Multer/Express error during upload:", err);
    res.status(500).json({ message: 'Upload failed', error: err.message || err.toString() });
  } else {
    next();
  }
});

export default router;
