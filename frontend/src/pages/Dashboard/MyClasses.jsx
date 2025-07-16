import { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [pending, setPending] = useState([]);

  useEffect(() => {
    api.get('/users/my-courses')
      .then(res => {
        setClasses(res.data.classes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load classes:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    api.get('/inquiries/my')
      .then(res => {
        const all = res.data.inquiries || [];
        setPending(all.filter(i => i.status === 'approved'));
      })
      .catch(() => setPending([]));
  }, []);

  const now = new Date();

  const getClassStatus = (cls) => {
    if (cls.expiresAt && new Date(cls.expiresAt) < now) {
      return 'expired';
    }
    if (cls.expiresAt && new Date(cls.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return 'expiring-soon';
    }
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiresAt) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAndSortedClasses = () => {
    let filtered = classes.filter(cls => {
      const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      const status = getClassStatus(cls);
      switch (filterStatus) {
        case 'active':
          return status === 'active';
        case 'expiring':
          return status === 'expiring-soon';
        case 'expired':
          return status === 'expired';
        default:
          return true;
      }
    });

    switch (sortBy) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'expiry':
        return filtered.sort((a, b) => {
          if (!a.expiresAt && !b.expiresAt) return 0;
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return new Date(a.expiresAt) - new Date(b.expiresAt);
        });
      case 'recent':
      default:
        return filtered.sort((a, b) => new Date(b.enrolledAt || b.createdAt || 0) - new Date(a.enrolledAt || a.createdAt || 0));
    }
  };

  const filteredClasses = filteredAndSortedClasses();

  const getStats = () => {
    const activeCount = classes.filter(cls => getClassStatus(cls) === 'active').length;
    const expiringCount = classes.filter(cls => getClassStatus(cls) === 'expiring-soon').length;
    const expiredCount = classes.filter(cls => getClassStatus(cls) === 'expired').length;
    
    return { activeCount, expiringCount, expiredCount, totalCount: classes.length };
  };

  const stats = getStats();

  const payOnline = async (courseId, price) => {
    try {
      const res = await api.post('/payment/initiate-payment', {
        courseId,
        amount: price,
        phoneNumber: JSON.parse(localStorage.getItem('user') || '{}').phoneNumber
      });
      const data = res.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.sandbox
        ? 'https://sandbox.payhere.lk/pay/checkout'
        : 'https://www.payhere.lk/pay/checkout';
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'sandbox') return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start payment');
    }
  };

  const payBank = async (courseId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const form = new FormData();
        form.append('courseId', courseId);
        form.append('slip', file);
        await api.post('/bank-payment/submit', form);
        alert('Bank payment submitted for review');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to submit bank payment');
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="my-classes-container">
        <style>{myClassesStyles}</style>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading your enrolled classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-classes-container">
      <style>{myClassesStyles}</style>
      
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📚 My Enrolled Classes</h1>
          <p className="page-subtitle">Access your course content and track your learning progress</p>
        </div>
        
        {/* Stats Cards */}
        {classes.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalCount}</div>
                <div className="stat-label">Total Classes</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeCount}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{stats.expiringCount}</div>
                <div className="stat-label">Expiring Soon</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-value">{stats.expiredCount}</div>
                <div className="stat-label">Expired</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="pending-payments-section">
          <h3 className="pending-title">Pending Payments</h3>
          <ul className="list-group">
            {pending.map((p) => (
              <li key={p._id} className="list-group-item d-flex justify-content-between align-items-center flex-column flex-md-row">
                <span className="mb-2 mb-md-0">{p.courseId?.title}</span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => payOnline(p.courseId._id, p.courseId.price)}>
                    Pay Online
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => payBank(p.courseId._id)}>
                    Bank Deposit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls */}
      {classes.length > 0 && (
        <div className="controls-section">
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              📋 All Classes ({classes.length})
            </button>
            <button 
              className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              ✅ Active ({stats.activeCount})
            </button>
            <button 
              className={`filter-tab ${filterStatus === 'expiring' ? 'active' : ''}`}
              onClick={() => setFilterStatus('expiring')}
            >
              ⚠️ Expiring ({stats.expiringCount})
            </button>
            <button 
              className={`filter-tab ${filterStatus === 'expired' ? 'active' : ''}`}
              onClick={() => setFilterStatus('expired')}
            >
              ❌ Expired ({stats.expiredCount})
            </button>
          </div>

          {/* Search and Sort */}
          <div className="search-sort-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Search your classes..."
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
                <option value="recent">Recently Enrolled</option>
                <option value="alphabetical">A-Z</option>
                <option value="expiry">By Expiry Date</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      <div className="classes-section">
        {classes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>No classes enrolled yet</h3>
            <p>Start your learning journey by enrolling in courses that interest you.</p>
            <Link to="/courses" className="cta-button">
              🔍 Browse Courses
            </Link>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No classes found</h3>
            <p>Try adjusting your search terms or filters.</p>
            <button 
              className="cta-button"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              🔄 Reset Filters
            </button>
          </div>
        ) : (
          <div className="classes-grid">
            {filteredClasses.map((cls) => {
              const status = getClassStatus(cls);
              const daysUntilExpiry = getDaysUntilExpiry(cls.expiresAt);
              
              return (
                <div key={cls._id} className={`class-card ${status}`}>
                  <div className="card-header">
                    <div className="class-title-section">
                      <h3 className="class-title">{cls.title}</h3>
                      <div className={`status-badge ${status}`}>
                        {status === 'active' && '✅ Active'}
                        {status === 'expiring-soon' && '⚠️ Expiring Soon'}
                        {status === 'expired' && '❌ Expired'}
                      </div>
                    </div>
                  </div>

                  <div className="card-content">
                    {cls.description && (
                      <p className="class-description">{cls.description}</p>
                    )}
                    
                    <div className="class-meta">
                      <div className="meta-item">
                        <span className="meta-label">📅 Expires:</span>
                        <span className="meta-value">{formatDate(cls.expiresAt)}</span>
                      </div>
                      
                      {daysUntilExpiry !== null && (
                        <div className="meta-item">
                          <span className="meta-label">⏰ Days remaining:</span>
                          <span className={`meta-value ${daysUntilExpiry <= 7 ? 'urgent' : ''}`}>
                            {daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired'}
                          </span>
                        </div>
                      )}

                      {cls.courseContent && (
                        <div className="meta-item">
                          <span className="meta-label">🎥 Videos:</span>
                          <span className="meta-value">{cls.courseContent.length}</span>
                        </div>
                      )}

                      {cls.price && (
                        <div className="meta-item">
                          <span className="meta-label">💰 Price:</span>
                          <span className="meta-value">Rs. {cls.price}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="progress-section">
                      {status !== 'expired' && (
                        <div className="access-info">
                          <span className="access-icon">🎓</span>
                          <span className="access-text">Full Access Granted</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/dashboard/course/${cls._id}`}
                      className={`enter-button ${status === 'expired' ? 'disabled' : ''}`}
                      onClick={(e) => status === 'expired' && e.preventDefault()}
                    >
                      {status === 'expired' ? (
                        <>🔒 Access Expired</>
                      ) : (
                        <>🚀 Enter Class</>
                      )}
                    </Link>
                  </div>

                  {status === 'expiring-soon' && daysUntilExpiry <= 3 && (
                    <div className="urgency-banner">
                      ⚡ Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const myClassesStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .my-classes-container {
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
  }

  .header-content {
    text-align: center;
    margin-bottom: 30px;
  }

  .page-title {
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 10px;
  }

  .page-subtitle {
    color: #7f8c8d;
    font-size: 16px;
    font-weight: 500;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 15px;
    padding: 25px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .stat-icon {
    font-size: 36px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 14px;
    color: #7f8c8d;
    font-weight: 500;
    margin-top: 4px;
  }

  .controls-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .pending-payments-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .pending-payments-section .pending-title {
    margin-bottom: 15px;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }

  .pending-payments-section .list-group-item {
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 10px;
    border: 1px solid #e9ecef;
  }

  .filter-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-tab {
    padding: 10px 18px;
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.7);
    color: #666;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }

  .filter-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .filter-tab:hover:not(.active) {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  .search-sort-controls {
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
    min-width: 180px;
  }

  .sort-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .classes-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .classes-grid {
    display: grid;
    gap: 25px;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  .class-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
  }

  .class-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .class-card.active {
    border-color: rgba(40, 167, 69, 0.3);
  }

  .class-card.expiring-soon {
    border-color: rgba(255, 193, 7, 0.5);
  }

  .class-card.expired {
    border-color: rgba(220, 53, 69, 0.3);
    opacity: 0.8;
  }

  .card-header {
    padding: 25px 25px 20px;
    border-bottom: 1px solid #f0f2f5;
  }

  .class-title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
  }

  .class-title {
    font-size: 20px;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1.3;
    flex: 1;
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .status-badge.active {
    background: #d4edda;
    color: #155724;
  }

  .status-badge.expiring-soon {
    background: #fff3cd;
    color: #856404;
  }

  .status-badge.expired {
    background: #f8d7da;
    color: #721c24;
  }

  .card-content {
    padding: 25px;
  }

  .class-description {
    color: #5a6c7d;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .class-meta {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr 1fr;
  }

  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  .meta-label {
    font-size: 13px;
    color: #7f8c8d;
    font-weight: 500;
  }

  .meta-value {
    font-size: 13px;
    color: #2c3e50;
    font-weight: 600;
  }

  .meta-value.urgent {
    color: #e74c3c;
    font-weight: 700;
  }

  .card-footer {
    padding: 20px 25px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-section {
    flex: 1;
  }

  .access-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #28a745;
    font-size: 14px;
    font-weight: 500;
  }

  .enter-button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .enter-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: none;
  }

  .enter-button.disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .urgency-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
    color: white;
    padding: 8px 15px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
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
    filter: grayscale(0.5);
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
    margin-bottom: 30px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 15px 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 16px;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: none;
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
  @media (max-width: 768px) {
    .my-classes-container {
      padding: 15px;
    }

    .page-header {
      padding: 20px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .stat-card {
      padding: 20px;
    }

    .stat-icon {
      font-size: 28px;
    }

    .stat-value {
      font-size: 20px;
    }

    .controls-section {
      padding: 20px;
    }

    .search-sort-controls {
      flex-direction: column;
      gap: 15px;
    }

    .search-bar {
      min-width: 100%;
    }

    .sort-select {
      width: 100%;
    }

    .classes-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .filter-tabs {
      gap: 8px;
    }

    .filter-tab {
      padding: 8px 14px;
      font-size: 12px;
    }

    .class-meta {
      grid-template-columns: 1fr;
    }

    .card-footer {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }

    .enter-button {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .class-title-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .page-title {
      font-size: 24px;
    }

    .card-header, .card-content {
      padding: 20px;
    }

    .urgency-banner {
      position: relative;
      margin: -25px -20px 20px;
    }
  }
`;

export default MyClasses;