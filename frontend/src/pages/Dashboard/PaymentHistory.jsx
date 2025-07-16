import { useEffect, useState } from 'react';
import api from '../../api';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [bankPayments, setBankPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentRes, bankRes] = await Promise.all([
          api.get('/payment/history').catch(() => ({ data: { payments: [] } })),
          api.get('/bank-payment/my').catch(() => ({ data: { requests: [] } }))
        ]);
        
        setPayments(paymentRes.data.payments || []);
        setBankPayments(bankRes.data.requests || []);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { class: 'status-success', icon: '✅', label: 'Completed' },
      'pending': { class: 'status-pending', icon: '⏳', label: 'Pending' },
      'failed': { class: 'status-failed', icon: '❌', label: 'Failed' },
      'approved': { class: 'status-success', icon: '✅', label: 'Approved' },
      'rejected': { class: 'status-failed', icon: '❌', label: 'Rejected' },
      'under_review': { class: 'status-pending', icon: '👀', label: 'Under Review' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || { class: 'status-pending', icon: '❓', label: status };
    return config;
  };

  const getPaymentTypeIcon = (type) => {
    return type === 'online' ? '💳' : '🏦';
  };

  const combineAndFilterPayments = () => {
    // Combine online and bank payments
    const onlinePayments = payments.map(p => ({
      ...p,
      type: 'online',
      courseTitle: p.courseId?.title || 'Unknown Course',
      displayAmount: p.amount,
      id: p._id,
      date: p.createdAt
    }));

    const bankPaymentsFormatted = bankPayments.map(b => ({
      ...b,
      type: 'bank',
      courseTitle: b.courseId?.title || 'Unknown Course',
      displayAmount: b.courseId?.price || 0,
      id: b._id,
      date: b.createdAt,
      orderId: `BANK-${b._id?.slice(-8)}`
    }));

    let combined = [...onlinePayments, ...bankPaymentsFormatted];

    // Filter by tab
    if (activeTab === 'online') {
      combined = combined.filter(p => p.type === 'online');
    } else if (activeTab === 'bank') {
      combined = combined.filter(p => p.type === 'bank');
    }

    // Filter by search term
    if (searchTerm) {
      combined = combined.filter(p => 
        p.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldest':
        return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'amount-high':
        return combined.sort((a, b) => (b.displayAmount || 0) - (a.displayAmount || 0));
      case 'amount-low':
        return combined.sort((a, b) => (a.displayAmount || 0) - (b.displayAmount || 0));
      case 'course':
        return combined.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
      default:
        return combined;
    }
  };

  const filteredPayments = combineAndFilterPayments();

  const getStats = () => {
    const completedPayments = filteredPayments.filter(p => 
      ['completed', 'approved'].includes(p.status?.toLowerCase())
    );
    const totalSpent = completedPayments.reduce((sum, p) => sum + (p.displayAmount || 0), 0);
    const pendingCount = filteredPayments.filter(p => 
      ['pending', 'under_review'].includes(p.status?.toLowerCase())
    ).length;

    return { totalSpent, completedCount: completedPayments.length, pendingCount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="payment-history-container">
        <style>{paymentHistoryStyles}</style>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <style>{paymentHistoryStyles}</style>
      
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">💰 Payment History</h1>
          <p className="page-subtitle">Track all your course payments and transactions</p>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <div className="stat-value">{formatAmount(stats.totalSpent)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingCount}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{filteredPayments.length}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        {/* Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            📋 All Payments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'online' ? 'active' : ''}`}
            onClick={() => setActiveTab('online')}
          >
            💳 Online Payments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            🏦 Bank Payments
          </button>
        </div>

        {/* Search and Sort */}
        <div className="filter-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by course, order ID, or status..."
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
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
              <option value="course">Course Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="payments-section">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No payments found</h3>
            <p>{searchTerm ? 'Try adjusting your search terms' : 'You haven\'t made any payments yet.'}</p>
          </div>
        ) : (
          <div className="payments-grid">
            {filteredPayments.map((payment) => {
              const statusConfig = getStatusBadge(payment.status);
              
              return (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-type">
                      <span className="type-icon">{getPaymentTypeIcon(payment.type)}</span>
                      <span className="type-label">
                        {payment.type === 'online' ? 'Online Payment' : 'Bank Transfer'}
                      </span>
                    </div>
                    <div className={`status-badge ${statusConfig.class}`}>
                      <span className="status-icon">{statusConfig.icon}</span>
                      <span className="status-text">{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="payment-content">
                    <h3 className="course-title">{payment.courseTitle}</h3>
                    
                    <div className="payment-details">
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">{formatAmount(payment.displayAmount)}</span>
                      </div>
                      
                      {payment.orderId && (
                        <div className="detail-row">
                          <span className="detail-label">Order ID:</span>
                          <span className="detail-value order-id">{payment.orderId}</span>
                        </div>
                      )}
                      
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(payment.date)}</span>
                      </div>

                      {payment.type === 'bank' && payment.slipUrl && (
                        <div className="detail-row">
                          <span className="detail-label">Slip:</span>
                          <a
                            href={payment.slipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="slip-link"
                          >
                            📄 View Slip
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="payment-footer">
                    <div className="payment-meta">
                      <span className="transaction-id">
                        ID: {payment.id?.slice(-8)}
                      </span>
                      {payment.type === 'online' && payment.paymentMethod && (
                        <span className="payment-method">
                          via {payment.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const paymentHistoryStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .payment-history-container {
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

  .tab-navigation {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.7);
    color: #666;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }

  .tab-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .tab-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  .filter-controls {
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

  .payments-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .payments-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  .payment-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .payment-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 15px;
    border-bottom: 1px solid #f0f2f5;
  }

  .payment-type {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .type-icon {
    font-size: 20px;
  }

  .type-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-success {
    background: #d4edda;
    color: #155724;
  }

  .status-pending {
    background: #fff3cd;
    color: #856404;
  }

  .status-failed {
    background: #f8d7da;
    color: #721c24;
  }

  .payment-content {
    padding: 20px;
  }

  .course-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 15px;
    line-height: 1.3;
  }

  .payment-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    font-size: 14px;
    color: #7f8c8d;
    font-weight: 500;
  }

  .detail-value {
    font-size: 14px;
    color: #2c3e50;
    font-weight: 600;
  }

  .detail-value.amount {
    color: #27ae60;
    font-size: 16px;
  }

  .order-id {
    font-family: 'Courier New', monospace;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
  }

  .slip-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .slip-link:hover {
    color: #5a6fd8;
    text-decoration: underline;
  }

  .payment-footer {
    padding: 15px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
  }

  .payment-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #6c757d;
  }

  .transaction-id {
    font-family: 'Courier New', monospace;
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #6c757d;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    filter: grayscale(1);
  }

  .empty-state h3 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #495057;
  }

  .empty-state p {
    font-size: 16px;
    line-height: 1.5;
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
    .payment-history-container {
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

    .filter-controls {
      flex-direction: column;
      gap: 15px;
    }

    .search-bar {
      min-width: 100%;
    }

    .sort-select {
      width: 100%;
    }

    .payments-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .tab-navigation {
      gap: 10px;
    }

    .tab-btn {
      padding: 10px 16px;
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .payment-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .detail-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .payment-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    .page-title {
      font-size: 24px;
    }
  }
`;

export default PaymentHistory;