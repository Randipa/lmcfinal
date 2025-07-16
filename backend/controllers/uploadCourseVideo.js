const Course = require('../models/Course');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Trim to avoid accidental whitespace causing auth failures
const BUNNY_API_KEY = process.env.BUNNY_API_KEY?.trim();
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID?.trim();

// Upload video file to Bunny.net
exports.uploadCourseVideo = async (req, res) => {
  try {
    const { title, isPublic, visibleFrom, subtitles } = req.body;
    const courseId = req.params.id;
    const file = req.file;

    console.log('Environment variables check:');
    console.log('BUNNY_API_KEY:', BUNNY_API_KEY ? 'Present' : 'Missing');
    console.log('BUNNY_LIBRARY_ID:', BUNNY_LIBRARY_ID ? 'Present' : 'Missing');

    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
      console.error('Missing Bunny credentials:', {
        hasApiKey: !!BUNNY_API_KEY,
        hasLibraryId: !!BUNNY_LIBRARY_ID
      });
      return res.status(500).json({ 
        message: 'Bunny API credentials missing',
        details: {
          hasApiKey: !!BUNNY_API_KEY,
          hasLibraryId: !!BUNNY_LIBRARY_ID
        }
      });
    }

    if (!file) return res.status(400).json({ message: 'Video file is required' });

    console.log('Creating video in Bunny library...');
    
    // 1. Create video in Bunny library
    const createRes = await axios.post(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      { title },
      { 
        headers: { 
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const videoId = createRes.data.guid;
    console.log('Video created with ID:', videoId);

    // 2. Upload file to Bunny
    const filePath = file.path;
    const fileStats = fs.statSync(filePath);
    console.log('Uploading file of size:', fileStats.size, 'bytes');

    const uploadRes = await axios.put(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      fs.readFileSync(filePath),
      {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 300000, // 5 minute timeout for large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('Upload response status:', uploadRes.status);
    
    // Clean up local file
    fs.unlinkSync(filePath);

    // 3. Save to course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const videoUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
    const contentItem = {
      title,
      videoId,
      videoUrl,
      isPublic: isPublic === 'true',
      visibleFrom: visibleFrom ? new Date(visibleFrom) : null,
      subtitles: subtitles ? JSON.parse(subtitles) : [],
      description: req.body.description,
      duration: req.body.duration,
      hidden: req.body.hidden === 'true'
    };

    course.courseContent.push(contentItem);
    await course.save();

    res.status(200).json({ 
      message: 'Video uploaded and added to course successfully', 
      videoUrl, 
      videoId,
      course: {
        id: course._id,
        title: course.title,
        contentCount: course.courseContent.length
      }
    });
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? Object.keys(error.config.headers) : undefined
      }
    });

    // Clean up file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    let status = 500;
    let message = 'Video upload failed';

    if (error.response) {
      status = error.response.status;
      message = error.response.data?.message || error.response.data || error.message;
      
      if (status === 401) {
        message = 'Invalid Bunny API credentials. Please check your API key.';
      } else if (status === 404) {
        message = 'Bunny library not found. Please check your library ID.';
      }
    } else if (error.code === 'ENOTFOUND') {
      message = 'Cannot connect to Bunny.net. Please check your internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      message = 'Upload timeout. Please try again with a smaller file.';
    }

    res.status(status).json({ 
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};