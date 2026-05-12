const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger.util.js');

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, uniqueSuffix + ext);
	}
});

const fileFilter = (req, file, cb) => {
	const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Tipo de ficheiro não suportado. Use: JPEG, PNG, WEBP, GIF'), false);
	}
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadImage = async (req, res) => {
	try {
		if (!req.file)
			return res.status(400).json({ success: false, msg: 'Nenhum ficheiro enviado.' });

		const protocol = req.protocol || 'http';
		const host = req.get('host');
		const url = `${protocol}://${host}/uploads/${req.file.filename}`;
		return res.status(200).json({ success: true, data: { url } });
	} catch (error) {
		logger.error('Erro ao fazer upload:', error);
		return res.status(500).json({ success: false, msg: 'Erro ao fazer upload.' });
	}
};

const deleteImage = (filename) => {
	return new Promise((resolve, reject) => {
		const filePath = path.join(uploadsDir, filename);
		fs.unlink(filePath, (err) => {
			if (err && err.code !== 'ENOENT') reject(err);
			else resolve(true);
		});
	});
};

module.exports = { upload, uploadImage, deleteImage };
