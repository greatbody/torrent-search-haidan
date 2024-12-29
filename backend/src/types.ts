export interface SearchResult {
  videoName: string;
  torrentName: string;
  title: string;
  size: string;
  seeders: number;
  isFree: boolean;
  encryptedDownload: string;
  groupId: string;
  tags: string[];
  discount?: string;
  feePercentage?: string;
  progress: string;
}

export interface DownloadInfo {
  url: string;
  isValid: string;
}

export interface QBittorrentConfig {
  url: string;
}

export interface ResultGroup {
  groupId: string;
  videoName: string;
  items: SearchResult[];
}

export interface SearchResponse {
  groups: ResultGroup[];
}
