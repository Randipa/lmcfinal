const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const REGION = process.env.BUNNY_STORAGE_REGION || '';
const BASE_HOSTNAME = 'storage.bunnycdn.com';
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME;
const ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY;

function uploadFile(filePath, destFileName) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);

    const options = {
      method: 'PUT',
      host: HOSTNAME,
      path: `/${STORAGE_ZONE_NAME}/${destFileName}`,
      headers: {
        AccessKey: ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString('utf8');
      });
      res.on('end', () => resolve(data));
    });

    req.on('error', (error) => reject(error));

    readStream.pipe(req);
  });
}

module.exports = { uploadFile };
