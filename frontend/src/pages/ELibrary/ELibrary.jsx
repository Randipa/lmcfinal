import { useEffect, useState } from 'react';
import { Search, ArrowLeft, Book, FileText, Video, Download, Eye, Filter, Grid, List, Star, Calendar, User } from 'lucide-react';

// Mock API for demonstration
const api = {
  get: (url, config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          '/library': {
            items: [
              { _id: '1', title: 'Advanced Mathematics', description: 'Comprehensive guide to calculus and linear algebra', fileUrl: 'sample.pdf', category: 'book', rating: 4.5, downloads: 1250, date: '2024-01-15' },
              { _id: '2', title: 'Physics Past Papers 2023', description: 'Complete collection of physics examination papers', fileUrl: 'physics.pdf', category: 'passpaper', rating: 4.8, downloads: 890, date: '2024-02-20' },
              { _id: '3', title: 'Chemistry Lab Manual', description: 'Practical experiments and procedures', fileUrl: 'chem.pdf', category: 'document', rating: 4.2, downloads: 567, date: '2024-01-10' },
              { _id: '4', title: 'Biology Lectures', description: 'Video series covering cell biology fundamentals', fileUrl: 'bio.mp4', category: 'video', rating: 4.6, downloads: 1100, date: '2024-03-05' },
              { _id: '5', title: 'Research Methodology', description: 'Guide to academic research and writing', fileUrl: 'research.pdf', category: 'other', rating: 4.3, downloads: 445, date: '2024-02-28' }
            ]
          }
        };
        resolve({ data: mockData[url] || { items: [] } });
      }, 500);
    });
  }
};

const ELibrary = () => {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    api
      .get('/library', { params: { category } })
      .then(res => {
        setItems(res.data.items.filter(item => item.category === category) || []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
    setActive(null);
  }, [category]);

  const openViewer = (item) => {
    setActive(item);
  };

  const closeViewer = () => {
    setActive(null);
  };

  const categories = [
    { key: 'passpaper', label: 'Pass Papers', icon: FileText, color: 'from-blue-500 to-blue-600', count: 45 },
    { key: 'book', label: 'Books', icon: Book, color: 'from-green-500 to-green-600', count: 128 },
    { key: 'document', label: 'Documents', icon: FileText, color: 'from-purple-500 to-purple-600', count: 67 },
    { key: 'video', label: 'Videos', icon: Video, color: 'from-red-500 to-red-600', count: 89 },
    { key: 'other', label: 'Others', icon: Star, color: 'from-orange-500 to-orange-600', count: 23 }
  ];

  const filtered = items
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    .filter(i => i.rating >= filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'downloads': return b.downloads - a.downloads;
        case 'date': return new Date(b.date) - new Date(a.date);
        default: return a.title.localeCompare(b.title);
      }
    });

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const StarRating = ({ rating }) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">E-Library</h1>
          <p className="text-gray-600">Discover and access educational resources</p>
        </div>

        {!category ? (
          /* Category Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(c => {
              const IconComponent = c.icon;
              return (
                <div
                  key={c.key}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${c.color} p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                  onClick={() => setCategory(c.key)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{c.label}</h3>
                      <p className="text-white/80">{c.count} items available</p>
                    </div>
                    <IconComponent className="w-12 h-12 text-white/80" />
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setCategory(null)}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to categories</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="title">Sort by Title</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="downloads">Sort by Downloads</option>
                  <option value="date">Sort by Date</option>
                </select>
                
                <select
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterRating}
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filtered.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}
                  >
                    {viewMode === 'grid' ? (
                      <div className="flex flex-col h-full">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4 flex-grow">{item.description}</p>
                        
                        <div className="space-y-3">
                          <StarRating rating={item.rating} />
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center">
                              <Download className="w-4 h-4 mr-1" />
                              {item.downloads}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <button
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            onClick={() => openViewer(item)}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-grow">
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">{item.title}</h3>
                          <p className="text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center space-x-4">
                            <StarRating rating={item.rating} />
                            <span className="text-sm text-gray-500">{item.downloads} downloads</span>
                          </div>
                        </div>
                        <button
                          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          onClick={() => openViewer(item)}
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Modal/Viewer */}
            {active && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{active.title}</h2>
                      <p className="text-gray-600 mt-1">{active.description}</p>
                    </div>
                    <button
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                      onClick={closeViewer}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {active.fileUrl.endsWith('.pdf') ? (
                      <iframe
                        src={active.fileUrl}
                        className="w-full h-96 border rounded-lg"
                        title="Preview"
                      />
                    ) : (
                      <div className="text-center py-12">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                        <a
                          href={active.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ELibrary;