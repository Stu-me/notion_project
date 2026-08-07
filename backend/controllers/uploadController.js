const asyncHandler = require('express-async-handler');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg']);

const normalizeMimeType = (value) => value?.split(';')[0]?.trim().toLowerCase();

// Saves a short browser-recorded audio clip locally and returns a URL suitable for an audio block.
const uploadAudio = asyncHandler(async (req, res) => {
  const { audioData } = req.body;
  const mimeType = normalizeMimeType(req.body?.mimeType);

  if (!audioData || !mimeType || !ALLOWED_AUDIO_TYPES.has(mimeType)) {
    res.status(400);
    throw new Error('A supported audio recording is required');
  }

  const base64Match = audioData.match(/^data:[^,]+;base64,(.+)$/i);
  const encodedAudio = base64Match ? base64Match[1] : audioData;
  const buffer = Buffer.from(encodedAudio, 'base64');
  if (!buffer.length || buffer.length > MAX_AUDIO_BYTES) {
    res.status(400);
    throw new Error('Audio must be between 1 byte and 3 MB');
  }

  const extension = mimeType === 'audio/mpeg' ? 'mp3' : mimeType === 'audio/mp4' ? 'm4a' : mimeType === 'audio/ogg' ? 'ogg' : 'webm';
  const uploadsDirectory = path.join(__dirname, '..', 'uploads', 'audio');
  await fs.mkdir(uploadsDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(uploadsDirectory, filename), buffer);

  // Local storage is appropriate for development; use cloud object storage before multi-server production deployment.
  return res.status(201).json({ url: `${req.protocol}://${req.get('host')}/uploads/audio/${filename}` });
});

module.exports = { uploadAudio };
