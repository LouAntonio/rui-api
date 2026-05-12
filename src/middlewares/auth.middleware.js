const logger = require('../utils/logger.util.js');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const isAuthenticated = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ success: false, msg: 'Não autenticado.', auth: true });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_USERSECRET);
		req.user = decoded;
		next();
	} catch (error) {
		logger.error('Erro de autenticação:', error);
		return res
			.status(401)
			.json({ success: false, msg: 'Token inválido ou expirado.', auth: true });
	}
};

const isAdmin = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ success: false, msg: 'Não autenticado.', auth: true });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
		if (decoded.role !== 'ADMIN') {
			return res.status(403).json({ success: false, msg: 'Acesso negado.' });
		}
		req.user = decoded;
		next();
	} catch (error) {
		logger.error('Erro de autenticação admin:', error);
		return res
			.status(401)
			.json({ success: false, msg: 'Token inválido ou expirado.', auth: true });
	}
};

const { requirePermission } = require('./rbac.middleware');

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	handler: (req, res) => {
		return res.status(429).json({
			success: false,
			msg: 'Muitas tentativas de login. Tente novamente daqui a 15 minutos.'
		});
	}
});

const optionalAuth = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next();
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_USERSECRET);
		req.user = decoded;
	} catch (error) {
		req.user = null;
	}
	next();
};

const optionalAdminAuth = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next();
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
		if (decoded.role === 'ADMIN') {
			req.user = decoded;
		}
	} catch (error) {
		req.user = null;
	}
	next();
};

module.exports = {
	isAuthenticated,
	isAdmin,
	loginLimiter,
	optionalAuth,
	optionalAdminAuth,
	requirePermission,
	PERMISSIONS: require('./rbac.middleware').PERMISSIONS
};
