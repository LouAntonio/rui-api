const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const allowedURIs = [process.env.FRONTEND_URL || 'http://localhost:5173'];

router.get('/:filename', (req, res) => {
	const uploadsDir = path.join(__dirname, '../../uploads');
	const filePath = path.join(uploadsDir, req.params.filename);

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ success: false, msg: 'Ficheiro não encontrado' });
	}

	res.setHeader('Access-Control-Allow-Origin', allowedURIs[0]);
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	const ext = path.extname(req.params.filename).toLowerCase();
	const mimeTypes = {
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.webp': 'image/webp'
	};

	res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
	fs.createReadStream(filePath).pipe(res);
});

module.exports = router;
