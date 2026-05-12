const logger = require('../utils/logger.util');

const errorHandler = (err, req, res, _next) => {
	let error = { ...err };
	error.message = err.message;

	// Log error
	logger.error(err);

	// JWT errors
	if (err.name === 'JsonWebTokenError') {
		const message = 'Invalid token';
		error = { message, statusCode: 401 };
	}

	if (err.name === 'TokenExpiredError') {
		const message = 'Token expired';
		error = { message, statusCode: 401 };
	}

	// 500
	res.status(error.statusCode || 500).json({
		success: false,
		msg: error.message || 'Internal Server Error',
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
};

const notFound = (req, res, next) => {
	const error = new Error(`Not Found - ${req.originalUrl}`);
	res.status(404).json({ success: false, msg: error.message });
	next(error);
};

module.exports = {
	errorHandler,
	notFound
};
