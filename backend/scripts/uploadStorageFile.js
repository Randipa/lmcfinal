const path = require('path');
const { uploadFile } = require('../utils/bunnyStorageUploader');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node uploadStorageFile.js <filePath> [destName]');
  process.exit(1);
}

const destName = process.argv[3] || path.basename(filePath);

uploadFile(filePath, destName)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error('Upload error:', err.message);
    process.exit(1);
  });
