const LibraryItem = require('../models/LibraryItem');

exports.createItem = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const baseUrl =
      process.env.BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${req.protocol}://${req.get('host')}`);
    const fileUrl = `${baseUrl}/uploads/library/${req.file.filename}`;
    const item = new LibraryItem({ title, description, fileUrl });
    await item.save();
    res.status(201).json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload file' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await LibraryItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await LibraryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete item' });
  }
};
