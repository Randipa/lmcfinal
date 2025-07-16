import { useEffect, useState } from 'react';
import api from '../../api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get('/notices/my')
      .then(res => {
        setNotices(res.data.notices || []);
        setLoaded(true);
        if ((res.data.notices || []).length > 0) {
          // Simple notification toast instead of alert
          showNotification('You have new notices');
        }
      })
      .catch(() => {
        setLoaded(true);
        setNotices([]);
      });
  }, []);

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNoticeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'urgent':
        return '🚨';
      case 'announcement':
        return '📢';
      case 'reminder':
        return '⏰';
      case 'event':
        return '🎉';
      default:
        return '📝';
    }
  };

  if (!loaded) {
    return (
      <div className="notices-container">
        <style>{noticesStyles}</style>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notices-container">
      <style>{noticesStyles}</style>
      
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📢 Notices & Announcements</h1>
          <p className="page-subtitle">Stay updated with important information</p>
        </div>
        
        {notices.length > 0 && (
          <div className="notices-count">
            <span className="count-badge">{notices.length}</span>
            <span className="count-text">
              {notices.length === 1 ? 'notice' : 'notices'}
            </span>
          </div>
        )}
      </div>

      {/* Notices List */}
      <div className="notices-section">
        {notices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No notices available</h3>
            <p>You're all caught up! Check back later for new announcements.</p>
          </div>
        ) : (
          <div className="notices-list">
            {notices.map((notice, index) => (
              <div key={notice._id} className={`notice-card ${notice.type || 'default'}`}>
                <div className="notice-header">
                  <div className="notice-icon">
                    {getNoticeIcon(notice.type)}
                  </div>
                  <div className="notice-title-section">
                    <h3 className="notice-title">{notice.title}</h3>
                    {notice.createdAt && (
                      <span className="notice-date">{formatDate(notice.createdAt)}</span>
                    )}
                  </div>
                  {notice.type && (
                    <div className={`notice-type-badge ${notice.type.toLowerCase()}`}>
                      {notice.type}
                    </div>
                  )}
                </div>
                
                <div className="notice-content">
                  <p className="notice-message">{notice.message}</p>
                  
                  {notice.course && (
                    <div className="notice-course">
                      <span className="course-label">📚 Related to:</span>
                      <span className="course-name">{notice.course.title}</span>
                    </div>
                  )}
                  
                  {notice.author && (
                    <div className="notice-author">
                      <span className="author-label">👤 From:</span>
                      <span className="author-name">{notice.author.name}</span>
                    </div>
                  )}
                </div>

                {notice.priority === 'high' && (
                  <div className="priority-indicator">
                    ⚡ High Priority
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const noticesStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .notices-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 20px;
  }

  .page-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 25px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-content {
    flex: 1;
  }

  .page-title {
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  .page-subtitle {
    color: #7f8c8d;
    font-size: 16px;
    font-weight: 500;
  }

  .notices-count {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 15px 20px;
    border-radius: 25px;
    color: white;
  }

  .count-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 700;
    min-width: 40px;
    text-align: center;
  }

  .count-text {
    font-weight: 600;
    font-size: 14px;
  }

  .notices-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .notices-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .notice-card {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border-left: 5px solid #e9ecef;
    position: relative;
    overflow: hidden;
  }

  .notice-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  }

  .notice-card.urgent {
    border-left-color: #dc3545;
    background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
  }

  .notice-card.announcement {
    border-left-color: #007bff;
    background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  }

  .notice-card.reminder {
    border-left-color: #ffc107;
    background: linear-gradient(135deg, #fff 0%, #fffbf0 100%);
  }

  .notice-card.event {
    border-left-color: #28a745;
    background: linear-gradient(135deg, #fff 0%, #f8fff8 100%);
  }

  .notice-header {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 20px;
  }

  .notice-icon {
    font-size: 24px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .notice-title-section {
    flex: 1;
    min-width: 0;
  }

  .notice-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .notice-date {
    font-size: 13px;
    color: #7f8c8d;
    font-weight: 500;
  }

  .notice-type-badge {
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }

  .notice-type-badge.urgent {
    background: #ffebee;
    color: #c62828;
  }

  .notice-type-badge.announcement {
    background: #e3f2fd;
    color: #1565c0;
  }

  .notice-type-badge.reminder {
    background: #fff8e1;
    color: #ef6c00;
  }

  .notice-type-badge.event {
    background: #e8f5e8;
    color: #2e7d32;
  }

  .notice-content {
    margin-left: 39px;
  }

  .notice-message {
    font-size: 16px;
    color: #444;
    line-height: 1.6;
    margin-bottom: 15px;
  }

  .notice-course, .notice-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .course-label, .author-label {
    color: #7f8c8d;
    font-weight: 500;
  }

  .course-name, .author-name {
    color: #2c3e50;
    font-weight: 600;
  }

  .priority-indicator {
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
    color: white;
    padding: 8px 15px;
    font-size: 12px;
    font-weight: 600;
    border-bottom-left-radius: 15px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #6c757d;
  }

  .empty-icon {
    font-size: 80px;
    margin-bottom: 25px;
    filter: grayscale(0.3);
  }

  .empty-state h3 {
    font-size: 28px;
    margin-bottom: 15px;
    color: #495057;
    font-weight: 600;
  }

  .empty-state p {
    font-size: 16px;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
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

  .notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 10px 30px rgba(17, 153, 142, 0.4);
    z-index: 1000;
    transform: translateX(400px);
    transition: all 0.3s ease;
  }

  .notification-toast.show {
    transform: translateX(0);
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .notices-container {
      padding: 15px;
    }

    .page-header {
      padding: 20px;
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .notices-section {
      padding: 20px;
    }

    .notice-card {
      padding: 20px;
    }

    .notice-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .notice-title-section {
      order: -1;
      width: 100%;
    }

    .notice-content {
      margin-left: 0;
    }

    .notice-title {
      font-size: 18px;
    }

    .notice-message {
      font-size: 15px;
    }

    .notices-count {
      width: 100%;
      justify-content: center;
    }

    .notification-toast {
      left: 20px;
      right: 20px;
      transform: translateY(-100px);
    }

    .notification-toast.show {
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 24px;
    }

    .notice-card {
      padding: 15px;
    }

    .notice-header {
      gap: 10px;
    }

    .notice-icon {
      font-size: 20px;
    }

    .notice-title {
      font-size: 16px;
    }

    .notice-message {
      font-size: 14px;
    }

    .priority-indicator {
      position: relative;
      margin: 15px -15px -15px;
      border-radius: 0;
      text-align: center;
    }
  }
`;

export default Notices;