import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HaidanService } from './services/haidan';
import { QBittorrentService } from './services/qbittorrent';
import { generateKey, decrypt } from './helpers/crypto';
import { DownloadInfo } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize encryption key when app starts
generateKey();

app.use(cors());
app.use(express.json());

const haidanService = new HaidanService(process.env.HAIDAN_COOKIE || '');
const qbittorrentService = new QBittorrentService({
  url: process.env.QBITTORRENT_URL || 'http://localhost:8080',
});

app.post('/api/search', async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const results = await haidanService.search(keyword);
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    const { encryptedData, category } = req.body;
    if (!encryptedData) {
      return res.status(400).json({ error: 'Missing encryptedData parameter' });
    }

    const decryptedLink: DownloadInfo = decrypt(encryptedData);
    if (!decryptedLink) {
      return res.status(400).json({ error: 'Invalid download link' });
    }

    await qbittorrentService.addTorrent(decryptedLink.url, category);
    res.json({ success: true });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
