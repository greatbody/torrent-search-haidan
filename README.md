# Haidan-QBit Interface

A web interface to search videos on haidan.video and download them using qBittorrent.

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Fill in your haidan.video cookie and qBittorrent credentials

3. Start development servers:
```bash
npm run dev
```

## Features
- Search videos on haidan.video
- Automatic selection of best free download link
- Direct download to qBittorrent
- Simple and clean UI

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Download Client: qBittorrent
