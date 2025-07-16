import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UploadCourseContent from '../../components/UploadCourseContent';
import AuthDebug from '../../components/AuthDebug';
import CourseDetailsForm from '../../components/CourseDetailsForm';
import api from '../../api';

function CourseUploader() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [courseContent, setCourseContent] = useState({
    paidContent: [],
    unpaidContent: [],
    subtitles: []
  });

  // New state for content management
  const [contentItems, setContentItems] = useState([
    { id: Date.now(), title: '', description: '', duration: '', videoUrl: '', paidAccess: false, unpaidAccess: false, hidden: false }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token) {
      alert('You must be logged in to access this page.');
      navigate('/login');
      return;
    }
    try {
      const parsedUser = user ? JSON.parse(user) : null;
      setUserInfo(parsedUser);
      if (parsedUser?.userRole !== 'admin' && parsedUser?.userRole !== 'teacher') {
        alert('You must be an admin or teacher to upload videos.');
        navigate('/');
        return;
      }
      loadCourseContent();
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate, courseId]);

  const loadCourseContent = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}/content`);
      setCourseContent(data);
      
      // Load existing content items for editing
      const allContent = [...(data.paidContent || []), ...(data.unpaidContent || [])];
      if (allContent.length > 0) {
        const loadedItems = allContent.map(content => ({
          id: content._id || Date.now() + Math.random(),
          title: content.title || '',
          description: content.description || '',
          duration: content.duration || '',
          videoUrl: content.videoUrl || content.url || '',
          paidAccess: data.paidContent?.some(p => p._id === content._id) || false,
          unpaidAccess: data.unpaidContent?.some(u => u._id === content._id) || false,
          hidden: !!content.hidden,
          existingId: content._id
        }));
        setContentItems(loadedItems.length > 0 ? loadedItems : [
          { id: Date.now(), title: '', description: '', duration: '', videoUrl: '', paidAccess: false, unpaidAccess: false, hidden: false }
        ]);
      }
    } catch (error) {
      console.error('Error loading course content:', error);
    }
  };

  const addContentItem = () => {
    setContentItems(prev => [
      ...prev,
      { id: Date.now(), title: '', description: '', duration: '', videoUrl: '', paidAccess: false, unpaidAccess: false, hidden: false }
    ]);
  };

  const updateContentItem = (id, field, value) => {
    setContentItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Ensure only one access type is selected at a time
  const setAccessForItem = (id, type) => {
    setContentItems(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            paidAccess: type === 'paid',
            unpaidAccess: type === 'unpaid'
          }
        : item
    ));
  };

  const deleteContentItem = (id) => {
    if (contentItems.length === 1) {
      alert('At least one content item is required');
      return;
    }
    setContentItems(prev => prev.filter(item => item.id !== id));
  };

  const saveAllContent = async () => {
    const invalidItems = contentItems.filter(item =>
      !item.title.trim() ||
      !item.videoUrl.trim() ||
      item.paidAccess === item.unpaidAccess
    );

    if (invalidItems.length > 0) {
      alert('Please fill in all fields and choose either paid or unpaid access for each content item.');
      return;
    }

    setIsSaving(true);
    try {
      for (const item of contentItems) {
        const contentData = {
          title: item.title,
          videoUrl: item.videoUrl,
          description: item.description || `Video content: ${item.title}`,
          duration: item.duration || '00:00',
          hidden: item.hidden
        };

        if (item.existingId) {
          await api.put(`/courses/${courseId}/content/${item.existingId}`, {
            ...contentData,
            isPublic: item.unpaidAccess
          });
        } else if (item.paidAccess) {
          await api.post(`/courses/${courseId}/content`, {
            ...contentData,
            isPublic: false,
            contentType: 'paid'
          });
        } else if (item.unpaidAccess) {
          await api.post(`/courses/${courseId}/content`, {
            ...contentData,
            isPublic: true,
            contentType: 'unpaid'
          });
        }
      }

      alert('All content saved successfully!');
      loadCourseContent();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = () => {
    alert('Content updated successfully!');
  };

  const deleteContent = () => {
    if (window.confirm('Are you sure you want to delete all content?')) {
      setContentItems([{ id: Date.now(), title: '', description: '', duration: '', videoUrl: '', paidAccess: false, unpaidAccess: false, hidden: false }]);
      alert('All content deleted!');
    }
  };

  if (!userInfo) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app-container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .page-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .page-subtitle {
          color: #7f8c8d;
          font-size: clamp(14px, 2vw, 16px);
        }

        .tab-navigation {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.9);
          color: #666;
          font-weight: 600;
          font-size: clamp(14px, 2vw, 16px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          min-width: 150px;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .tab-btn:hover:not(.active) {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 25px;
          padding: clamp(20px, 4vw, 40px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .content-grid {
          display: grid;
          gap: 25px;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .content-item {
          background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
          border-radius: 20px;
          padding: 25px;
          position: relative;
          border: 2px solid #d4edda;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .content-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .content-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .hide-content-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .checkbox:checked {
          background: #28a745;
          border-color: #28a745;
        }

        .delete-item-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
        }

        .delete-item-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.5);
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-label {
          font-size: 12px;
          color: #555;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e1e8ed;
          border-radius: 12px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: white;
        }

        .form-input::placeholder {
          color: #adb5bd;
        }

        .access-controls {
          display: flex;
          gap: 25px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .access-option {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .access-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .access-checkbox:checked {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }

        .add-content-section {
          margin: 30px 0;
          display: flex;
          justify-content: center;
        }

        .add-content-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 20px 40px;
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          border: 3px dashed #ff9a9e;
          border-radius: 20px;
          color: #d73027;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .add-content-btn:hover {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255, 154, 158, 0.4);
        }

        .plus-icon {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
          box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }

        .action-btn {
          padding: 18px 25px;
          border: none;
          border-radius: 15px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .update-btn {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
        }

        .save-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .delete-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          color: white;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.1);
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .course-details-form {
          padding: 20px 0;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .app-container {
            padding: 15px;
          }

          .main-content {
            max-width: 100%;
          }

          .content-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .input-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .tab-navigation {
            gap: 10px;
          }

          .tab-btn {
            padding: 12px 20px;
            min-width: 120px;
          }

          .content-wrapper {
            padding: 20px;
          }

          .access-controls {
            flex-direction: column;
            gap: 15px;
          }

          .action-buttons {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .add-content-btn {
            padding: 15px 25px;
            font-size: 14px;
          }

          .plus-icon {
            width: 25px;
            height: 25px;
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .app-container {
            padding: 10px;
          }

          .content-item {
            padding: 20px;
          }

          .content-item-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .delete-item-btn {
            align-self: flex-end;
          }

          .form-input {
            padding: 12px;
            font-size: 13px;
          }

          .action-btn {
            padding: 15px 20px;
            font-size: 14px;
          }
        }

        /* Large Desktop */
        @media (min-width: 1200px) {
          .content-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Extra Large Screens */
        @media (min-width: 1600px) {
          .main-content {
            max-width: 1400px;
          }
        }
      `}</style>

      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Course Content Manager</h1>
          <p className="page-subtitle">Manage your course content and access permissions</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Course Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content Management
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {activeTab === 'details' && (
            <div className="course-details-form">
              <CourseDetailsForm courseId={courseId} />
            </div>
          )}

          {activeTab === 'content' && (
            <>
              {/* Content Items Grid */}
              <div className="content-grid">
                {contentItems.map((item, index) => (
                  <div key={item.id} className="content-item">
                    <div className="content-item-header">
                      <div className="hide-content-checkbox">
                        <input 
                          type="checkbox" 
                          className="checkbox"
                          id={`hide-${item.id}`}
                          checked={item.hidden}
                          onChange={(e) => updateContentItem(item.id, 'hidden', e.target.checked)}
                        />
                        <label htmlFor={`hide-${item.id}`}>Hide content</label>
                      </div>

                      {contentItems.length > 1 && (
                        <button 
                          className="delete-item-btn"
                          onClick={() => deleteContentItem(item.id)}
                          title="Delete this content"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Input Fields */}
                    <div className="input-grid">
                      <div className="input-group">
                        <label className="input-label">Video Title</label>
                        <input 
                          type="text" 
                          className="form-input"
                          placeholder="Enter video title"
                          value={item.title}
                          onChange={(e) => updateContentItem(item.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Additional Info</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Optional description"
                          value={item.description}
                          onChange={(e) => updateContentItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-grid">
                      <div className="input-group">
                        <label className="input-label">Video URL</label>
                        <input 
                          type="url" 
                          className="form-input"
                          placeholder="https://example.com/video.mp4"
                          value={item.videoUrl}
                          onChange={(e) => updateContentItem(item.id, 'videoUrl', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="00:00"
                          value={item.duration}
                          onChange={(e) => updateContentItem(item.id, 'duration', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Access Controls */}
                    <div className="access-controls">
                      <div className="access-option">
                        <input
                          type="radio"
                          name={`access-${item.id}`}
                          className="access-checkbox"
                          id={`paid-${item.id}`}
                          checked={item.paidAccess}
                          onChange={() => setAccessForItem(item.id, 'paid')}
                        />
                        <label htmlFor={`paid-${item.id}`}>Restrict to paid students</label>
                      </div>
                      <div className="access-option">
                        <input
                          type="radio"
                          name={`access-${item.id}`}
                          className="access-checkbox"
                          id={`unpaid-${item.id}`}
                          checked={item.unpaidAccess}
                          onChange={() => setAccessForItem(item.id, 'unpaid')}
                        />
                        <label htmlFor={`unpaid-${item.id}`}>Allow access for unpaid students</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Content Button */}
              <div className="add-content-section">
                <div className="add-content-btn" onClick={addContentItem}>
                  <div className="plus-icon">+</div>
                  <span>Add more content</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="action-btn update-btn" onClick={updateContent}>
                  Update Content
                </button>
                <button 
                  className="action-btn save-btn" 
                  onClick={saveAllContent}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Content'}
                </button>
                <button className="action-btn delete-btn" onClick={deleteContent}>
                  Delete Content
                </button>
              </div>
            </>
          )}
        </div>

        {/* Debug Info */}
        {showDebug && <AuthDebug />}
      </div>
    </div>
  );
}

export default CourseUploader;