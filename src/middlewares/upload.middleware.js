const multer = require('multer');
const cloudinary = require('../configs/cloudinary.js');
const logger = require('../utils/logger.util.js');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Tipo de ficheiro não suportado. Use: JPEG, PNG, WEBP, GIF'), false);
	}
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadToCloudinary = (fileBuffer, folder = 'dishes') => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: 'image' },
			(error, result) => {
				if (error) reject(error);
				else resolve(result);
			}
		);
		stream.end(fileBuffer);
	});
};

const uploadImage = async (req, res) => {
	try {
		if (!req.file)
			return res.status(400).json({ success: false, msg: 'Nenhum ficheiro enviado.' });
		const result = await uploadToCloudinary(req.file.buffer, 'dishes');
		return res
			.status(200)
			.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
	} catch (error) {
		logger.error('Erro ao fazer upload:', error);
		return res.status(500).json({ success: false, msg: 'Erro ao fazer upload.' });
	}
};

const deleteImage = (publicId) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.destroy(publicId, (error, result) => {
			if (error) reject(error);
			else resolve(result);
		});
	});
};

module.exports = { upload, uploadToCloudinary, uploadImage, deleteImage };
