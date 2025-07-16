const axios = require('axios');

// Trim to prevent stray whitespace from breaking authentication
const BUNNY_API_KEY = process.env.BUNNY_API_KEY?.trim();
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID?.trim();

exports.listVideos = async (req, res) => {
  try {
    const { page = 1, perPage = 100 } = req.query;
    const bunnyRes = await axios.get(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${perPage}`,
      { headers: { AccessKey: BUNNY_API_KEY } }
    );
    res.json({ videos: bunnyRes.data.items || [] });
  } catch (error) {
    console.error('Bunny list error:', error.message);
    res.status(500).json({ message: 'Failed to fetch videos', error: error.message });
  }
};
