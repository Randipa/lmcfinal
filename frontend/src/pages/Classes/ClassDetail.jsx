import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [now] = useState(new Date());
  const [showInquiry, setShowInquiry] = useState(false);
  const [guestSubmitted, setGuestSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    message: ''
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get(`/courses/${classId}`)
      .then(res => {
        setClassData(res.data.course);
        setHasAccess(res.data.hasAccess || false);
        setLoading(false);
      })
      .catch(() => {
        setMessage('Failed to fetch class details');
        setLoading(false);
      });
  }, [classId]);

  // Double-check access from user's enrolled courses
  useEffect(() => {
    if (!token) return;
    if (hasAccess) return;
    api.get('/users/my-courses')
      .then(res => {
        const enrolled = res.data.classes?.some(c => c._id === classId);
        if (enrolled) setHasAccess(true);
      })
      .catch(() => {});
  }, [classId, token, hasAccess]);

  const fetchInquiryInfo = async () => {
    if (!token) return;
    try {
      const res = await api.get('/inquiries/my');
      const all = res.data.inquiries || [];
      const courseInquiries = all.filter(i =>
        (i.courseId?._id || i.courseId) === classId
      );
      setInquiryCount(courseInquiries.length);
      if (courseInquiries.length > 0) {
        const latest = courseInquiries.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        setInquiryStatus(latest.status);
      } else {
        setInquiryStatus('');
      }
    } catch {
      setInquiryCount(0);
      setInquiryStatus('');
    }
  };

  useEffect(() => {
    fetchInquiryInfo();
  }, [classId, token]);

  const openInquiryForm = () => {
    if (token) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        message: ''
      });
    } else {
      setForm({ firstName: '', lastName: '', phoneNumber: '', message: '' });
    }
    setShowInquiry(true);
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inquiries', {
        courseId: classId,
        ...form
      });
      setMessage('Inquiry sent. Admin will enable payment soon.');
      setShowInquiry(false);
      if (token) {
        fetchInquiryInfo();
      } else {
        setGuestSubmitted(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send inquiry.';
      setMessage(msg);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '00:00';
    return duration;
  };

  const canViewVideo = (video) => {
    // If user has paid access, can view all videos
    if (hasAccess) return true;
    
    // If not paid, can only view public videos
    if (video.isPublic) return true;
    
    return false;
  };

  const getVideoStatus = (video) => {
    if (hasAccess) return 'full-access';
    if (video.isPublic) return 'free-preview';
    return 'premium-only';
  };

  if (loading) {
    return (
      <div className="class-detail-container">
        <style>{`
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
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="class-detail-container">
        <div className="error-message">
          <h3>Course not found</h3>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="class-detail-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .class-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .course-header {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .course-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .course-description {
          font-size: 16px;
          color: #5a6c7d;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .course-price {
          font-size: 24px;
          font-weight: 600;
          color: #27ae60;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-badge {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 18px;
        }

        .access-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 14px;
          margin-left: 15px;
        }

        .access-granted {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
        }

        .access-needed {
          background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
          color: white;
        }

        .login-prompt {
          background: rgba(255, 193, 7, 0.1);
          border: 2px solid #ffc107;
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }

        .login-prompt a {
          color: #856404;
          font-weight: 600;
          text-decoration: none;
        }

        .payment-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 25px;
          margin: 20px 0;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .payment-buttons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          color: #d73027;
          border: 2px solid #ff9a9e;
        }

        .btn-primary:hover, .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .content-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 30px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .video-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .video-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .video-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .video-card.premium-only {
          border-color: #ffc107;
          background: linear-gradient(135deg, #fff 0%, #fff8e1 100%);
        }

        .video-card.free-preview {
          border-color: #28a745;
          background: linear-gradient(135deg, #fff 0%, #f0fff4 100%);
        }

        .video-card.full-access {
          border-color: #007bff;
          background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
        }

        .video-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .video-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .video-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #7f8c8d;
        }

        .video-duration {
          background: #ecf0f1;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .video-status-badge {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-free {
          background: #d4edda;
          color: #155724;
        }

        .status-premium {
          background: #fff3cd;
          color: #856404;
        }

        .status-full {
          background: #cce5ff;
          color: #004085;
        }

        .video-content {
          padding: 0;
        }

        .video-player {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          height: 0;
          background: #000;
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

        .video-locked {
          padding: 40px 20px;
          text-align: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .lock-icon {
          font-size: 48px;
          color: #6c757d;
          margin-bottom: 15px;
        }

        .locked-message {
          color: #495057;
          font-size: 16px;
          margin-bottom: 20px;
        }

        .unlock-btn {
          background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .unlock-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
        }


        .message-alert {
          padding: 15px 20px;
          border-radius: 10px;
          margin: 20px 0;
          font-weight: 500;
        }

        .alert-info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #b6d4da;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .inquiry-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .inquiry-modal .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .error-message {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .class-detail-container {
            padding: 15px;
          }

          .course-header {
            padding: 20px;
          }

          .payment-buttons {
            flex-direction: column;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .video-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 20px;
            padding: 20px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .course-title {
            font-size: 20px;
          }

          .course-price {
            font-size: 18px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .access-status {
            margin-left: 0;
          }

          .section-title {
            font-size: 20px;
          }
        }
      `}</style>

      {/* Course Header */}
      <div className="course-header">
        <h1 className="course-title">{classData.title}</h1>
        <p className="course-description">{classData.description}</p>
        <div className="course-price">
          <span className="price-badge">Rs. {classData.price}</span>
          {hasAccess ? (
            <span className="access-status access-granted">
              ✅ Full Access
            </span>
          ) : (
            <span className="access-status access-needed">
              🔒 Purchase Required
            </span>
          )}
        </div>
      </div>

      {/* Login Prompt */}
      {!token && (
        <div className="login-prompt">
          <p>You can submit an inquiry without logging in, but logging in allows tracking.</p>
        </div>
      )}

      {showInquiry && (
        <div className="inquiry-modal">
          <div className="modal-content">
            <h4>Send Inquiry</h4>
            <form onSubmit={handleInquiry}>
              <input
                className="form-control mb-2"
                placeholder="First Name"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                required
              />
              <input
                className="form-control mb-2"
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                required
              />
              <input
                className="form-control mb-2"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                required
              />
              <textarea
                className="form-control mb-2"
                placeholder="Message (optional)"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">Submit</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInquiry(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Section */}
      {!hasAccess && (
        <div className="payment-section">
          <h3>💬 Request Payment Access</h3>
          <p>Send a request to enable payment for this course.</p>
          {token && inquiryCount > 0 && (
            <p>You have sent {inquiryCount} inquiry{inquiryCount > 1 ? 'ies' : 'y'}.</p>
          )}
          {(!token && guestSubmitted) ? (
            <p>Inquiry submitted.</p>
          ) : inquiryStatus === '' || inquiryStatus === 'rejected' ? (
            <div className="payment-buttons">
              <button className="btn-primary" onClick={openInquiryForm}>
                Send Inquiry
              </button>
            </div>
          ) : (
            <p>
              {inquiryStatus === 'pending' && 'Inquiry pending admin approval.'}
              {inquiryStatus === 'approved' &&
                'Inquiry approved. Payment option available in My Classes.'}
              {inquiryStatus === 'paid' && 'Payment completed.'}
            </p>
          )}
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <div className={`message-alert ${message.includes('success') || message.includes('submitted') ? 'alert-success' : message.includes('failed') || message.includes('Failed') ? 'alert-error' : 'alert-info'}`}>
          {message}
        </div>
      )}

      {/* Course Content */}
      <div className="content-section">
        <h2 className="section-title">
          📚 Course Content
        </h2>

        {!classData.courseContent || classData.courseContent.filter(v => !v.hidden).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📹</div>
            <h3>No videos available</h3>
            <p>This course doesn't have any content yet.</p>
          </div>
        ) : (
          <div className="video-grid">
            {classData.courseContent.filter(v => !v.hidden).map((video, index) => {
              const videoStatus = getVideoStatus(video);
              const canView = canViewVideo(video);
              
              return (
                <div key={index} className={`video-card ${videoStatus}`}>
                  <div className="video-header">
                    <h3 className="video-title">{video.title}</h3>
                    <div className="video-meta">
                      <span className="video-duration">
                        ⏱️ {formatDuration(video.duration)}
                      </span>
                      <span className={`video-status-badge ${
                        videoStatus === 'full-access' ? 'status-full' :
                        videoStatus === 'free-preview' ? 'status-free' : 'status-premium'
                      }`}>
                        {videoStatus === 'full-access' ? 'Full Access' :
                         videoStatus === 'free-preview' ? 'Free Preview' : 'Premium Only'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="video-content">
                    {canView && video.videoUrl ? (
                      <div className="video-player">
                        <iframe
                          src={video.videoUrl}
                          title={video.title}
                          loading="lazy"
                          allowFullScreen
                        ></iframe>
                        {user?.phoneNumber && (
                          <div className="student-id-overlay">
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="video-locked">
                        <div className="lock-icon">🔒</div>
                        <div className="locked-message">
                          {!token ? 
                            'Please log in to access this content' :
                            'Purchase this course to unlock this video'
                          }
                        </div>
                        {token && !hasAccess && (
                          <button
                            className="unlock-btn"
                            onClick={openInquiryForm}
                          >
                            🔓 Request Access
                          </button>
                        )}
                      </div>
                    )}
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

export default ClassDetail;