import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  const load = () => {
    setLoading(true);
    api.get('/teachers')
      .then(res => {
        setTeachers(res.data.teachers || []);
        setLoading(false);
      })
      .catch(() => {
        setTeachers([]);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const deleteTeacher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      load();
    } catch (err) {
      alert('Delete failed. Please try again.');
    }
  };

  const getUniqueGrades = () => {
    const gradeSet = new Set();
    teachers.forEach((t) => {
      if (t.grade) gradeSet.add(t.grade);
      t.classes?.forEach((c) => c.grade && gradeSet.add(c.grade));
    });
    return Array.from(gradeSet).sort((a, b) => a - b);
  };

  const getUniqueSubjects = () => {
    const subjSet = new Set();
    teachers.forEach((t) => {
      if (t.subject) subjSet.add(t.subject);
      t.classes?.forEach((c) => c.subject && subjSet.add(c.subject));
    });
    return Array.from(subjSet).sort();
  };

  const filteredAndSortedTeachers = () => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = 
        teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade =
        !filterGrade ||
        teacher.grade?.toString() === filterGrade ||
        teacher.classes?.some((c) => c.grade?.toString() === filterGrade);
      const matchesSubject =
        !filterSubject ||
        teacher.subject === filterSubject ||
        teacher.classes?.some((c) => c.subject === filterSubject);
      
      return matchesSearch && matchesGrade && matchesSubject;
    });

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
      case 'grade':
        return filtered.sort((a, b) => (a.grade || 0) - (b.grade || 0));
      case 'subject':
        return filtered.sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
      case 'recent':
        return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default:
        return filtered;
    }
  };

  const filteredTeachers = filteredAndSortedTeachers();

  const getTeacherInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStats = () => {
    const totalTeachers = teachers.length;
    const uniqueGrades = getUniqueGrades().length;
    const uniqueSubjects = getUniqueSubjects().length;
    const activeTeachers = teachers.filter(t => t.status !== 'inactive').length;
    
    return { totalTeachers, uniqueGrades, uniqueSubjects, activeTeachers };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="teacher-list-container">
        <style>{teacherListStyles}</style>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-list-container">
      <style>{teacherListStyles}</style>
      
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">👨‍🏫 Teacher Management</h1>
          <p className="page-subtitle">Manage your teaching staff and their information</p>
        </div>
        
        <div className="header-actions">
          <Link className="add-teacher-btn" to="/admin/teachers/create">
            ➕ Add New Teacher
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalTeachers}</div>
              <div className="stat-label">Total Teachers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <div className="stat-value">{stats.uniqueGrades}</div>
              <div className="stat-label">Grade Levels</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{stats.uniqueSubjects}</div>
              <div className="stat-label">Subjects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeTeachers}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search teachers by name, subject, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="filter-controls">
          <div className="filters">
            <select 
              value={filterGrade} 
              onChange={(e) => setFilterGrade(e.target.value)}
              className="filter-select"
            >
              <option value="">All Grades</option>
              {getUniqueGrades().map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>

            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="filter-select"
            >
              <option value="">All Subjects</option>
              {getUniqueSubjects().map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="subject">Sort by Subject</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>

          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              🔲 Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <span>Showing {filteredTeachers.length} of {teachers.length} teachers</span>
          {(searchTerm || filterGrade || filterSubject) && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilterGrade('');
                setFilterSubject('');
              }}
            >
              🔄 Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Teachers List */}
      <div className="teachers-section">
        {filteredTeachers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🏫</div>
            <h3>No teachers found</h3>
            <p>
              {teachers.length === 0 
                ? "No teachers have been added yet. Click 'Add New Teacher' to get started."
                : "No teachers match your current filters. Try adjusting your search terms."}
            </p>
            {teachers.length === 0 && (
              <Link to="/admin/teachers/create" className="cta-button">
                ➕ Add Your First Teacher
              </Link>
            )}
          </div>
        ) : (
          <div className={`teachers-${viewMode}`}>
            {filteredTeachers.map(teacher => (
              <div key={teacher._id} className="teacher-card">
                <div className="teacher-avatar">
                  <div className="avatar-circle">
                    {teacher.profileImage ? (
                      <img src={teacher.profileImage} alt={`${teacher.firstName} ${teacher.lastName}`} />
                    ) : (
                      <span className="avatar-initials">
                        {getTeacherInitials(teacher.firstName, teacher.lastName)}
                      </span>
                    )}
                  </div>
                  {teacher.status === 'active' && <div className="status-indicator active"></div>}
                </div>

                <div className="teacher-info">
                  <h3 className="teacher-name">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  
                  <div className="teacher-details">
                    {(teacher.classes && teacher.classes.length > 0
                      ? teacher.classes
                      : [{ grade: teacher.grade, subject: teacher.subject }]
                    ).map((c, idx) => (
                      <div className="detail-item" key={idx}>
                        <span className="detail-icon">🎓</span>
                        <span className="detail-text">
                          Grade {c.grade} - {c.subject}
                        </span>
                      </div>
                    ))}
                    
                    {teacher.email && (
                      <div className="detail-item">
                        <span className="detail-icon">📧</span>
                        <span className="detail-text">{teacher.email}</span>
                      </div>
                    )}
                    
                    {teacher.phone && (
                      <div className="detail-item">
                        <span className="detail-icon">📱</span>
                        <span className="detail-text">{teacher.phone}</span>
                      </div>
                    )}

                    {teacher.experience && (
                      <div className="detail-item">
                        <span className="detail-icon">⭐</span>
                        <span className="detail-text">{teacher.experience} years exp.</span>
                      </div>
                    )}
                  </div>

                  {teacher.bio && (
                    <div className="teacher-bio">
                      <p>{teacher.bio}</p>
                    </div>
                  )}
                </div>

                <div className="teacher-actions">
                  <Link 
                    className="action-btn edit-btn" 
                    to={`/admin/teachers/${teacher._id}/edit`}
                  >
                    ✏️ Edit
                  </Link>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => deleteTeacher(teacher._id, `${teacher.firstName} ${teacher.lastName}`)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const teacherListStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .teacher-list-container {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .page-title {
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 700;
    color: #2c3e50;
  }

  .page-subtitle {
    color: #7f8c8d;
    font-size: 16px;
    font-weight: 500;
    margin-top: 5px;
  }

  .header-actions {
    display: flex;
    gap: 15px;
  }

  .add-teacher-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(17, 153, 142, 0.3);
  }

  .add-teacher-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(17, 153, 142, 0.5);
    color: white;
    text-decoration: none;
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

  .search-section {
    margin-bottom: 20px;
  }

  .search-bar {
    max-width: 600px;
    margin: 0 auto;
  }

  .search-input {
    width: 100%;
    padding: 15px 25px;
    border: 2px solid #e1e8ed;
    border-radius: 30px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: white;
  }

  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .filters {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .filter-select, .sort-select {
    padding: 10px 15px;
    border: 2px solid #e1e8ed;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
  }

  .filter-select:focus, .sort-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .view-controls {
    display: flex;
    gap: 10px;
  }

  .view-btn {
    padding: 10px 15px;
    border: 2px solid #e1e8ed;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    color: #666;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .view-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
  }

  .view-btn:hover:not(.active) {
    background: white;
    border-color: #667eea;
  }

  .results-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #7f8c8d;
  }

  .clear-filters-btn {
    padding: 6px 12px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 15px;
    color: #6c757d;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .clear-filters-btn:hover {
    background: #e9ecef;
    color: #495057;
  }

  .teachers-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .teachers-grid {
    display: grid;
    gap: 25px;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  .teachers-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .teacher-card {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .teacher-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .teachers-list .teacher-card {
    flex-direction: row;
    align-items: center;
  }

  .teachers-grid .teacher-card {
    flex-direction: column;
    text-align: center;
  }

  .teacher-avatar {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  .teachers-list .avatar-circle {
    width: 60px;
    height: 60px;
  }

  .avatar-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-initials {
    color: white;
    font-size: 24px;
    font-weight: 700;
  }

  .teachers-list .avatar-initials {
    font-size: 20px;
  }

  .status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
  }

  .status-indicator.active {
    background: #28a745;
  }

  .teacher-info {
    flex: 1;
    min-width: 0;
  }

  .teacher-name {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 15px;
    line-height: 1.2;
  }

  .teachers-list .teacher-name {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .teacher-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
  }

  .teachers-list .teacher-details {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #5a6c7d;
  }

  .detail-icon {
    font-size: 16px;
    width: 20px;
    flex-shrink: 0;
  }

  .detail-text {
    font-weight: 500;
  }

  .teacher-bio {
    margin-bottom: 15px;
  }

  .teacher-bio p {
    font-size: 14px;
    color: #6c757d;
    line-height: 1.5;
    margin: 0;
  }

  .teacher-actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }

  .teachers-grid .teacher-actions {
    justify-content: center;
    width: 100%;
  }

  .action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .edit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: none;
  }

  .delete-btn {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: white;
  }

  .delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
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
    max-width: 500px;
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
    .teacher-list-container {
      padding: 15px;
    }

    .page-header {
      padding: 20px;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
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
      align-items: stretch;
      gap: 15px;
    }

    .filters {
      justify-content: space-between;
    }

    .filter-select, .sort-select {
      flex: 1;
      min-width: 100px;
    }

    .teachers-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .teachers-list .teacher-card {
      flex-direction: column;
      text-align: center;
      gap: 15px;
    }

    .teachers-list .teacher-details {
      flex-direction: column;
      gap: 8px;
    }

    .results-info {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .page-title {
      font-size: 24px;
    }

    .search-input {
      padding: 12px 20px;
      font-size: 14px;
    }

    .teacher-card {
      padding: 20px;
    }

    .teacher-actions {
      width: 100%;
      justify-content: center;
    }

    .filters {
      flex-direction: column;
      gap: 10px;
    }

    .filter-select, .sort-select {
      width: 100%;
    }
  }
`;

export default TeacherList;