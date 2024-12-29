import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult } from '../types';
import { encrypt } from '../helpers/crypto';

interface ResultGroup {
  groupId: string;
  videoName: string;
  items: SearchResult[];
}

export class HaidanService {
  private cookie: string;
  private baseUrl = 'https://haidan.video';

  constructor(cookie: string) {
    this.cookie = cookie;
  }

  async search(keyword: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/torrents.php`, {
        params: {
          search: keyword,
        },
        headers: {
          Cookie: this.cookie,
        },
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];
      const groups: { [key: string]: ResultGroup } = {};

      // Parse the search results table
      $('.torrent_panel_inner .torrent_group').each((_, groupElement) => {
        const group = $(groupElement);
        const groupId = group.find('.group_detail_wrap').attr('id')?.replace('group_detail_', '') || '';
        const videoName = group.find('.video_name_str').text().trim();

        groups[groupId] = {
          groupId,
          videoName,
          items: []
        };

        // Process each torrent item in the group
        group.find('.torrent_item').each((_, itemElement) => {
          const item = $(itemElement);
          const poster = item.siblings('.poster');
          const progressValue = poster.find('progress').attr('data-label');
          const progress = progressValue?.replace('%', '') || '0';
          const torrentName = item.find('.torrent_name_col a').first().text().trim();
          const title = `${videoName} ${torrentName}`;
          const downloadLink = item.find('.operation_col .copy-download-link').attr('data-clipboard-text') || '';
          const size = item.find('.video_size.table_cell').text().trim();
          const seeders = parseInt(item.find('.seeder_col.table_cell').text().trim(), 10) || 0;
          const isFree = item.find('.sp .pro_free').length > 0;

          // Extract tags
          const tags: string[] = [];

          // Extract tags from labels with specific background colors
          item.find('.torrent_name_col label[style*="background-color"]').each((_, labelElement) => {
            const tag = $(labelElement).find('b').text().trim();
            if (tag) {
              // Convert tag text to proper format
              if (tag === '中字') tags.push('中字');
              else if (tag === 'DIY') tags.push('DIY');
              else if (tag === '外语') tags.push('外语');
              else tags.push(tag);
            }
          });

          // Extract special tags (热门, etc)
          item.find('.sp .hot').each((_, el): void => { tags.push('热门'); });
          item.find('.sp .raw').each((_, el): void => { tags.push('原盘'); });

          // Extract discount and fee percentage
          let discount: string | undefined;
          let feePercentage: string | undefined;

          item.find('.sp img').each((_, el) => {
            const alt = $(el).attr('alt');
            const title = $(el).attr('title');
            if (alt?.includes('%')) {
              if (el.attribs.class?.includes('pro_free')) {
                feePercentage = '0%';
              } else if (el.attribs.class?.includes('pro_30pctdown')) {
                feePercentage = '30%';
              } else if (el.attribs.class?.includes('pro_50pctdown')) {
                feePercentage = '50%';
              }
            }
          });

          item.find('.sp span').each((_, el) => {
            const text = $(el).text().trim();
            if (text.includes('%')) {
              discount = text;
            }
          });

          if (title && downloadLink) {
            const downloadInfo = {
              url: downloadLink,
              isValid: 'YES'
            };
            const encryptedDownload = encrypt(downloadInfo);
            const result = {
              videoName,
              torrentName,
              title,
              size,
              seeders,
              isFree,
              encryptedDownload,
              groupId,
              tags,
              discount,
              feePercentage,
              progress,
            };
            results.push(result);
            groups[groupId].items.push(result);
          }
        });
      });

      return results;
    } catch (error) {
      console.error('Error searching Haidan:', error);
      throw new Error('Failed to search Haidan');
    }
  }

  // No need for getDownloadLink anymore since we get it directly from the search page
  async getDownloadLink(url: string): Promise<string> {
    return url;
  }
}
