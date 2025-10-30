// server.js
// Minimal but safe: accepts uploads, stores files in assets/content, appends metadata to contentAssetsDB.json

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, 'assets', 'content');
const DB_PATH = path.join(UPLOAD_DIR, 'contentAssetsDB.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');

// Multer storage and fileFilter for server-side validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = base.replace(/\s+/g, '_').toLowerCase();
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  }
});

function fileFilter (req, file, cb) {
  const okImage = /^image\/(png|jpeg|jpg)$/.test(file.mimetype);
  const okVideo = file.mimetype === 'video/mp4';
  const okAudio = /audio\/(mpeg|mp3)/.test(file.mimetype);

  if (file.fieldname === 'thumbnail' && okImage) return cb(null, true);
  if (file.fieldname === 'image' && okImage) return cb(null, true);
  if (file.fieldname === 'video' && okVideo) return cb(null, true);
  if (file.fieldname === 'audio' && okAudio) return cb(null, true);

  return cb(new Error(`Invalid file type for ${file.fieldname}`));
}

// Size limits: thumbnail ≤100KB; others configurable (e.g., 50MB)
const limits = { fileSize: 50 * 1024 * 1024 }; // general limit; thumbnail enforced separately

const upload = multer({ storage, fileFilter, limits });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cpUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

app.post('/upload', cpUpload, (req, res) => {
  try {
    // server-side thumbnail size check
    if (req.files.thumbnail && req.files.thumbnail[0].size > 100 * 1024) {
      // remove file
      fs.unlinkSync(req.files.thumbnail[0].path);
      return res.status(400).json({ success: false, message: 'Thumbnail must be ≤ 100 KB.' });
    }

    const dbRaw = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(dbRaw || '[]');
    const nextId = db.length ? Math.max(...db.map(i => i.id || 0)) + 1 : 1;

    // mediaType precedence: video, audio, hyperlink, fact, image
    let mediaType = 'image';
    if (req.files.video && req.files.video.length) mediaType = 'video';
    else if (req.files.audio && req.files.audio.length) mediaType = 'audio';
    else if (req.body && req.body.link && req.body.link.trim()) mediaType = 'hyperlink';
    else if (req.body && req.body.fullText && req.body.fullText.trim()) mediaType = 'fact';
    else mediaType = 'image';

    const entry = {
      id: nextId,
      category: req.body.category || '',
      filename: (req.body.filename || '').toString(),
      title: (req.body.title || '').toString(),
      tags: (req.body.tags || '').toString(),
      thumbnail: req.files.thumbnail?.[0] ? path.basename(req.files.thumbnail[0].filename) : null,
      image: req.files.image?.[0] ? path.basename(req.files.image[0].filename) : null,
      video: req.files.video?.[0] ? path.basename(req.files.video[0].filename) : null,
      audio: req.files.audio?.[0] ? path.basename(req.files.audio[0].filename) : null,
      link: (req.body.link || '').toString(),
      shortDescription: (req.body.shortDescription || '').toString(),
      fullText: (req.body.fullText || '').toString(),
      mediaType,
      uploadedAt: new Date().toISOString()
    };

    db.push(entry);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');

    res.json({ success: true, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
});