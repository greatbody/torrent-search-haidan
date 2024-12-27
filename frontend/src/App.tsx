import { useState } from 'react'
import { SearchResult } from './types'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const CATEGORIES = [
  { label: '动画片/Animation' },
  { label: '动画电影/Animated Movies' },
  { label: '华语电视剧/ChinaTV' },
  { label: '少儿电视剧/ChildrenTV' },
  { label: '成人电视剧/Adult TV' },
  { label: '纪录片/Documentary' },
  { label: '纪录片X/Documentary' },
  { label: '综艺/Variety Shows' },
  { label: '美剧/USAShow' },
  { label: '英剧/UKShow' },
  { label: '电影/Movies' },
];

function App() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [downloadSuccess, setDownloadSuccess] = useState<{ [key: string]: boolean }>({})
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  const handleSearch = async () => {
    if (!keyword.trim()) return

    setLoading(true)
    setError(null)
    setResults([])
    setDownloadSuccess({})
    
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      })

      if (!response.ok) {
        throw new Error('海胆服务器响应失败，请稍后重试！')
      }

      const data = await response.json()
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (result: SearchResult, category: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedData: result.encryptedDownload,
          category
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      setDownloadSuccess(prev => ({ ...prev, [result.encryptedDownload!]: true }))
      setShowCategoryModal(false)
      setSelectedResult(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add torrent')
    }
  }

  const openCategoryModal = (result: SearchResult) => {
    setSelectedResult(result)
    setShowCategoryModal(true)
  }

  return (
    <div className="container">
      <h1>资源聚合搜索</h1>
      <div className="search-box">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="关键字，电影名..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div className="button-group">
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '正在搜索...' : '搜索'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="results">
          {Object.values(results.reduce<{ [key: string]: { videoName: string, items: SearchResult[] } }>((groups, result) => {
            if (!groups[result.groupId]) {
              groups[result.groupId] = {
                videoName: result.videoName,
                items: []
              };
            }
            groups[result.groupId].items.push(result);
            return groups;
          }, {})).map(group => (
            <div key={group.items[0].groupId} className="result-group">
              <div className="group-header">
                <h2>{group.videoName}</h2>
              </div>
              <div className="group-items">
                {group.items.map(result => (
                  <div key={result.encryptedDownload} className="torrent-item">
                    <div className="item-details">
                      <p className="torrent-name">{result.torrentName}</p>
                      <div className="item-stats">
                        <span className="size">{result.size}</span>
                        <span className={`seeders ${result.seeders > 10 ? 'good-seeders' : ''}`}>
                          做种: {result.seeders}
                        </span>
                        {result.feePercentage && (
                          <span className="fee-tag">
                            {result.feePercentage === '0%' ? '免费' : `${result.feePercentage} 倍率`}
                          </span>
                        )}
                        {result.discount && <span className="discount-tag">{result.discount}</span>}
                        {result.tags.map((tag: string, index: number) => (
                          <span key={index} className={`tag ${tag.toLowerCase()}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => openCategoryModal(result)}
                      className={downloadSuccess[result.encryptedDownload!] ? 'success' : ''}
                      disabled={!!downloadSuccess[result.encryptedDownload!]}
                    >
                      {downloadSuccess[result.encryptedDownload!] ? '已添加' : '下载'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {showCategoryModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>选择分类</h3>
            <div className="category-list">
              {CATEGORIES.map(category => (
                <button
                  key={category.label}
                  onClick={() => handleDownload(selectedResult, category.label)}
                  className="category-button"
                >
                  {category.label}
                </button>
              ))}
            </div>
            <button onClick={() => {
              setShowCategoryModal(false)
              setSelectedResult(null)
            }} className="close-button">
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
