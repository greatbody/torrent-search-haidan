import axios from 'axios';
import { QBittorrentConfig } from '../types';
import { upsertEnv } from '../helpers/env';

export class QBittorrentService {
  private config: QBittorrentConfig;

  constructor(config: QBittorrentConfig) {
    this.config = config;
  }

  async login(): Promise<void> {
    const { QBITTORRENT_URL, QBITTORRENT_USERNAME, QBITTORRENT_PASSWORD } = process.env;
    if (!QBITTORRENT_URL || !QBITTORRENT_USERNAME || !QBITTORRENT_PASSWORD) {
      throw new Error('Please set QBITTORRENT_URL, QBITTORRENT_USERNAME and QBITTORRENT_PASSWORD in .env file');
    }

    const response = await axios.post(`${QBITTORRENT_URL}/api/v2/auth/login`, `username=${QBITTORRENT_USERNAME}&password=${QBITTORRENT_PASSWORD}`, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      }
    });

    const cookie = response.headers['set-cookie']?.[0]
      ?.split(';')[0]
      .trim();
    upsertEnv('QBITTORRENT_COOKIE', cookie || '');
  }

  async addTorrent(downloadLink: string, category?: string): Promise<void> {
    try {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const formData = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="urls"',
        '',
        downloadLink,
        `--${boundary}`,
        'Content-Disposition: form-data; name="autoTMM"',
        '',
        'true',
        `--${boundary}`,
        'Content-Disposition: form-data; name="cookie"',
        '',
        '',
        `--${boundary}`,
        'Content-Disposition: form-data; name="rename"',
        '',
        '',
        `--${boundary}`,
        'Content-Disposition: form-data; name="category"',
        '',
        category || '',
        `--${boundary}`,
        'Content-Disposition: form-data; name="paused"',
        '',
        'false',
        `--${boundary}`,
        'Content-Disposition: form-data; name="stopCondition"',
        '',
        'None',
        `--${boundary}`,
        'Content-Disposition: form-data; name="contentLayout"',
        '',
        'Original',
        `--${boundary}`,
        'Content-Disposition: form-data; name="dlLimit"',
        '',
        'NaN',
        `--${boundary}`,
        'Content-Disposition: form-data; name="upLimit"',
        '',
        'NaN',
        `--${boundary}--`,
        '',
      ].join('\r\n');

      await axios.post(`${this.config.url}/api/v2/torrents/add`, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'max-age=0',
          'upgrade-insecure-requests': '1',
          'Referer': `${this.config.url}/download.html`,
          'Referrer-Policy': 'same-origin',
          'Cookie': process.env.QBITTORRENT_COOKIE
        }
      });
    } catch (error: any) {
      // Try login
      await this.login();
      console.error('Failed to add torrent:', error);
      if (error.response?.status === 403) {
        // Try one more time
        await this.addTorrent(downloadLink, category);
      } else {
        console.error('Failed to add torrent:', error);
        throw new Error('Failed to add torrent to qBittorrent');
      }
    }
  }
}
