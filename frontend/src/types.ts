import { ReactNode } from 'react';

export interface SearchResult {
  groupId: string;
  videoName: string;
  torrentName: ReactNode;
  feePercentage: string | undefined;
  discount: string | undefined;
  tags: string[];
  title: string;
  encryptedDownload: string;
  size: string;
  seeders: number;
  isFree: boolean;
  progress: number;
}
