import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const dataDir = path.join(__dirname, '../../data');

// Ensure the data directory exists
async function ensureDataDir() {
  if (!existsSync(dataDir)) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function readData<T>(fileName: string, defaultData: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return defaultData;
    }
    throw error;
  }
}

export async function writeData<T>(fileName: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
