import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

function Recordings() {
  const { classId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());
  const [notices, setNotices] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    api.get(`/courses/${classId}`)
      .then(res => {
        const courseData = res.data.course;
        // filter out hidden content just in case backend returns it
        if (Array.isArray(courseData.courseContent)) {
          courseData.courseContent = courseData.courseContent.filter(c => !c.hidden);
        }

        setCourse(courseData);
        setHasAccess(res.data.hasAccess || false);
        // Auto-select first visible video if available
        if (courseData.courseContent?.length > 0) {
          setSelectedVideo(courseData.courseContent[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.get(`/notices?courseId=${classId}`)
      .then(res => setNotices(res.data.notices || []))
      .catch(() => setNotices([]));
  }, [classId]);

  const formatDuration = (duration) => {
    if (!duration) return '00:00';
    return duration;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAndSortedVideos = () => {
    if (!course?.courseContent) return [];

    let videos = course.courseContent
      .filter(video => !video.hidden)
      .filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

    switch (sortBy) {
      case 'newest':
        return videos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'oldest':
        return videos.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      case 'alphabetical':
        return videos.sort((a, b) => a.title.localeCompare(b.title));
      case 'duration':
        return videos.sort((a, b) => (b.duration || '00:00').localeCompare(a.duration || '00:00'));
      default:
        return videos;
    }
  };

  const downloadSubtitle = (subtitleUrl, language, videoTitle) => {
    const link = document.createElement('a');
    link.href = subtitleUrl;
    link.download = `${videoTitle}-${language}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="recordings-container">
        <style>{recordingsStyles}</style>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading course recordings...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="recordings-container">
        <style>{recordingsStyles}</style>
        <div className="error-state">
          <div className="error-icon">📹</div>
          <h2>Course not found</h2>
          <p>The course recordings you're looking for are not available.</p>
        </div>
      </div>
    );
  }

  const videos = filteredAndSortedVideos();

  return (
    <div className="recordings-container">
      <style>{recordingsStyles}</style>
      
      {/* Header */}
      <div className="recordings-header">
        <div className="header-content">
          <h1 className="course-title">{course.title}</h1>
          <div className="course-meta">
            <span className="video-count">📹 {videos.length} recordings</span>
            {hasAccess && (
              <span className="access-badge">🎓 Full Access</span>
            )}
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A-Z</option>
              <option value="duration">By Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices */}
      {notices.length > 0 && (
        <div className="notices-section">
          <h3 className="notices-title">📢 Important Notices</h3>
          <div className="notices-list">
            {notices.map(notice => (
              <div key={notice._id} className="notice-card">
                <h4 className="notice-title">{notice.title}</h4>
                <p className="notice-message">{notice.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {videos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No recordings found</h3>
            <p>{searchTerm ? 'Try adjusting your search terms' : 'No recordings are available for this course yet.'}</p>
          </div>
        ) : (
          <div className="content-layout">
            {/* Video Player Section */}
            <div className="player-section">
              {selectedVideo && (
                <div className="video-player-card">
                  <div className="player-header">
                    <h2 className="video-title">{selectedVideo.title}</h2>
                    <div className="video-info">
                      <span className="duration">⏱️ {formatDuration(selectedVideo.duration)}</span>
                      {selectedVideo.createdAt && (
                        <span className="upload-date">📅 {formatDate(selectedVideo.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="video-player">
                    {selectedVideo.videoUrl ? (
                      <>
                        <iframe
                          src={selectedVideo.videoUrl}
                          title={selectedVideo.title}
                          loading="lazy"
                          allowFullScreen
                        ></iframe>
                        {JSON.parse(localStorage.getItem('user') || '{}').phoneNumber && (
                          <div className="student-id-overlay">
                            {JSON.parse(localStorage.getItem('user') || '{}').phoneNumber}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-video">
                        <div className="no-video-icon">📹</div>
                        <p>Video not available</p>
                      </div>
                    )}
                  </div>

                  {/* Subtitles Section */}
                  {selectedVideo.subtitles?.length > 0 && (
                    <div className="subtitles-section">
                      <h4 className="subtitles-title">📝 Available Subtitles</h4>
                      <div className="subtitles-list">
                        {selectedVideo.subtitles.map((subtitle, idx) => (
                          <button
                            key={idx}
                            className="subtitle-button"
                            onClick={() => downloadSubtitle(subtitle.url, subtitle.language, selectedVideo.title)}
                          >
                            <span className="subtitle-language">{subtitle.language.toUpperCase()}</span>
                            <span className="download-icon">⬇️</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Description */}
                  {selectedVideo.description && (
                    <div className="video-description">
                      <h4>📄 Description</h4>
                      <p>{selectedVideo.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video List Section */}
            <div className="playlist-section">
              <div className="playlist-header">
                <h3 className="playlist-title">📋 Course Recordings</h3>
                <span className="playlist-count">{videos.length} videos</span>
              </div>
              
              <div className="videos-list">
                {videos.map((video, index) => {
                  const isVisible = hasAccess || video.isPublic || new Date(video.visibleFrom) <= now;
                  const isSelected = selectedVideo?._id === video._id || selectedVideo?.title === video.title;
                  
                  return (
                    <div
                      key={index}
                      className={`video-item ${isSelected ? 'selected' : ''} ${!isVisible ? 'unavailable' : ''}`}
                      onClick={() => isVisible && setSelectedVideo(video)}
                    >
                      <div className="video-thumbnail">
                        <div className="thumbnail-placeholder">
                          {isVisible ? '▶️' : '🔒'}
                        </div>
                        <span className="video-duration">{formatDuration(video.duration)}</span>
                      </div>
                      
                      <div className="video-details">
                        <h4 className="video-item-title">{video.title}</h4>
                        <div className="video-meta">
                          {video.createdAt && (
                            <span className="meta-date">{formatDate(video.createdAt)}</span>
                          )}
                          {video.subtitles?.length > 0 && (
                            <span className="meta-subtitles">📝 {video.subtitles.length} subtitles</span>
                          )}
                        </div>
                        {!isVisible && (
                          <div className="unavailable-notice">
                            Available from {formatDate(video.visibleFrom)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const recordingsStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .recordings-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 20px;
  }

  .recordings-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    margin-bottom: 25px;
  }

  .course-title {
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 15px;
    line-height: 1.2;
  }

  .course-meta {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
  }

  .video-count {
    color: #5a6c7d;
    font-weight: 500;
  }

  .access-badge {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }

  .controls-section {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-bar {
    flex: 1;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding: 12px 20px;
    border: 2px solid #e1e8ed;
    border-radius: 25px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }

  .sort-select {
    padding: 12px 20px;
    border: 2px solid #e1e8ed;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .sort-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .notices-section {
    background: rgba(255, 243, 205, 0.95);
    backdrop-filter: blur(15px);
    border: 2px solid #ffc107;
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 25px;
  }

  .notices-title {
    color: #856404;
    margin-bottom: 15px;
    font-size: 18px;
    font-weight: 600;
  }

  .notices-list {
    display: grid;
    gap: 15px;
  }

  .notice-card {
    background: rgba(255, 255, 255, 0.7);
    padding: 15px;
    border-radius: 10px;
    border-left: 4px solid #ffc107;
  }

  .notice-title {
    color: #856404;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .notice-message {
    color: #856404;
    line-height: 1.5;
  }

  .main-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .content-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    min-height: 600px;
  }

  .player-section {
    padding: 30px;
    border-right: 1px solid #e1e8ed;
  }

  .video-player-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-header {
    margin-bottom: 20px;
  }

  .video-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  .video-info {
    display: flex;
    gap: 20px;
    color: #7f8c8d;
    font-size: 14px;
    font-weight: 500;
  }

  .video-player {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    height: 0;
    background: #000;
    border-radius: 15px;
    overflow: hidden;
    margin-bottom: 25px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .video-player iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .student-id-overlay {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    pointer-events: none;
  }

  .no-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #6c757d;
  }

  .no-video-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }

  .subtitles-section {
    margin-bottom: 25px;
  }

  .subtitles-title {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 600;
  }

  .subtitles-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .subtitle-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
  }

  .subtitle-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .video-description {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-top: auto;
  }

  .video-description h4 {
    color: #2c3e50;
    margin-bottom: 10px;
    font-size: 16px;
  }

  .video-description p {
    color: #5a6c7d;
    line-height: 1.6;
  }

  .playlist-section {
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
  }

  .playlist-header {
    padding: 25px 25px 20px;
    border-bottom: 1px solid #e1e8ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .playlist-title {
    color: #2c3e50;
    font-size: 18px;
    font-weight: 600;
  }

  .playlist-count {
    color: #7f8c8d;
    font-size: 14px;
    font-weight: 500;
  }

  .videos-list {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 200px);
  }

  .video-item {
    display: flex;
    gap: 15px;
    padding: 20px 25px;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
  }

  .video-item:hover:not(.unavailable) {
    background: #f0f7ff;
    transform: translateX(5px);
  }

  .video-item.selected {
    background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
    border-right: 4px solid #667eea;
  }

  .video-item.unavailable {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .video-thumbnail {
    position: relative;
    width: 80px;
    height: 45px;
    background: #e9ecef;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
  }

  .video-duration {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }

  .video-details {
    flex: 1;
    min-width: 0;
  }

  .video-item-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .video-meta {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #7f8c8d;
    flex-wrap: wrap;
  }

  .unavailable-notice {
    font-size: 12px;
    color: #dc3545;
    margin-top: 5px;
    font-weight: 500;
  }

  .empty-state, .error-state {
    text-align: center;
    padding: 80px 20px;
    color: #6c757d;
  }

  .empty-icon, .error-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 20px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Mobile Responsiveness */
  @media (max-width: 1024px) {
    .content-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .player-section {
      border-right: none;
      border-bottom: 1px solid #e1e8ed;
    }

    .playlist-section {
      background: white;
    }
  }

  @media (max-width: 768px) {
    .recordings-container {
      padding: 15px;
    }

    .recordings-header {
      padding: 20px;
    }

    .controls-section {
      flex-direction: column;
      gap: 15px;
    }

    .search-bar {
      min-width: 100%;
    }

    .player-section {
      padding: 20px;
    }

    .video-title {
      font-size: 20px;
    }

    .video-info {
      flex-direction: column;
      gap: 8px;
    }

    .course-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  @media (max-width: 480px) {
    .video-item {
      padding: 15px 20px;
    }

    .video-thumbnail {
      width: 60px;
      height: 34px;
    }

    .playlist-header {
      padding: 20px;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
`;

export default Recordings;