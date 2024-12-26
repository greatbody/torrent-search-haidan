import { ReactNode } from 'react';

export interface SearchResult {
  groupId: any;
  videoName: string;
  torrentName: ReactNode;
  feePercentage: any;
  discount: any;
  tags: any;
  title: string;
  encryptedDownload: string;
  size: string;
  seeders: number;
  isFree: boolean;
}
