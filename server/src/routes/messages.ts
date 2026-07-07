import express from 'express';
import { Message } from '../models/Message';
import { readData, writeData } from '../utils/fileStorage';
import crypto from 'crypto';

const router = express.Router();
const MESSAGES_FILE = 'messages.json';

router.post('/', async (req, res) => {
  try {
    const messages = await readData<Message[]>(MESSAGES_FILE, []);
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      name: req.body.name,
      message: req.body.message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await writeData(MESSAGES_FILE, messages);
    
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error saving message', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const messages = await readData<Message[]>(MESSAGES_FILE, []);
    // Sort by createdAt descending
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

export default router;
