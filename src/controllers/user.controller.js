const userService = require('../services/user.service.js');
const logger = require('../utils/logger.util.js');

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict',
	maxAge: 7 * 24 * 60 * 60 * 1000
};

const setRefreshTokenCookie = (res, token) => {
	res.cookie('refreshToken', token, COOKIE_OPTIONS);
};

const clearRefreshTokenCookie = (res) => {
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict'
	});
};

const formatUser = (user) => ({
	id: user.id,
	name: user.name,
	surname: user.surname,
	email: user.email,
	role: user.role
});

const register = async (req, res) => {
	try {
		const { name, surname, email, password } = req.body;
		if (!name || !surname || !email || !password) {
			return res
				.status(400)
				.json({ success: false, msg: 'Todos os campos são obrigatórios.' });
		}
		const user = await userService.register(req.body);
		const tokens = await userService.generateTokensForUser(user);
		await userService.updateLastLogin(user.id);
		setRefreshTokenCookie(res, tokens.refreshToken);
		return res.status(201).json({
			success: true,
			data: {
				user: formatUser(user),
				accessToken: tokens.accessToken,
				expiresIn: tokens.expiresIn
			}
		});
	} catch (error) {
		if (error.statusCode === 409) {
			return res.status(409).json({ success: false, msg: error.message });
		}
		logger.error('Erro ao registar utilizador:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await userService.getUserByEmail(email);
		if (!user) return res.status(401).json({ success: false, msg: 'Credenciais inválidas.' });
		const valid = await userService.verifyPassword(password, user.password);
		if (!valid) return res.status(401).json({ success: false, msg: 'Credenciais inválidas.' });
		await userService.updateLastLogin(user.id);
		const tokens = await userService.generateTokensForUser(user);
		setRefreshTokenCookie(res, tokens.refreshToken);
		return res.status(200).json({
			success: true,
			data: {
				user: formatUser(user),
				accessToken: tokens.accessToken,
				expiresIn: tokens.expiresIn
			}
		});
	} catch (error) {
		logger.error('Erro ao fazer login:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const adminLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await userService.getUserByEmail(email);
		if (!user) return res.status(401).json({ success: false, msg: 'Credenciais inválidas.' });
		const valid = await userService.verifyPassword(password, user.password);
		if (!valid) return res.status(401).json({ success: false, msg: 'Credenciais inválidas.' });
		if (user.role !== 'ADMIN')
			return res.status(403).json({ success: false, msg: 'Acesso negado.' });
		await userService.updateLastLogin(user.id);
		const tokens = await userService.generateTokensForUser(user, true);
		setRefreshTokenCookie(res, tokens.refreshToken);
		return res.status(200).json({
			success: true,
			data: {
				user: formatUser(user),
				accessToken: tokens.accessToken,
				expiresIn: tokens.expiresIn
			}
		});
	} catch (error) {
		logger.error('Erro ao fazer login admin:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const refreshToken = async (req, res) => {
	try {
		const token = req.cookies?.refreshToken;
		if (!token)
			return res.status(401).json({ success: false, msg: 'Refresh token não fornecido.' });
		const rt = await userService.verifyRefreshToken(token);
		if (!rt)
			return res
				.status(401)
				.json({ success: false, msg: 'Refresh token inválido ou expirado.' });
		const user = await userService.getUserById(rt.userId);
		if (!user)
			return res.status(401).json({ success: false, msg: 'Utilizador não encontrado.' });
		await userService.revokeRefreshToken(token);
		const tokens = await userService.generateTokensForUser(user, user.role === 'ADMIN');
		setRefreshTokenCookie(res, tokens.refreshToken);
		return res.status(200).json({
			success: true,
			data: {
				accessToken: tokens.accessToken,
				expiresIn: tokens.expiresIn
			}
		});
	} catch (error) {
		logger.error('Erro ao fazer refresh token:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const logout = async (req, res) => {
	try {
		const token = req.cookies?.refreshToken;
		if (token) await userService.revokeRefreshToken(token);
		clearRefreshTokenCookie(res);
		return res.status(200).json({ success: true, msg: 'Logout efetuado.' });
	} catch (error) {
		logger.error('Erro ao fazer logout:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const logoutAll = async (req, res) => {
	try {
		await userService.revokeAllUserRefreshTokens(req.user.id);
		clearRefreshTokenCookie(res);
		return res.status(200).json({ success: true, msg: 'Logout global efetuado.' });
	} catch (error) {
		logger.error('Erro ao fazer logout global:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const isLoggedIn = async (req, res) => {
	return res.status(200).json({ success: true, data: { user: req.user } });
};

const requestPasswordReset = async (req, res) => {
	res.status(501).json({ success: false, msg: 'Não implementado.' });
};

const resetPassword = async (req, res) => {
	res.status(501).json({ success: false, msg: 'Não implementado.' });
};

const listUsers = async (req, res) => {
	try {
		const result = await userService.listUsers(req.body);
		return res.status(200).json({ success: true, data: result });
	} catch (error) {
		logger.error('Erro ao listar utilizadores:', error);
		return res
			.status(500)
			.json({ success: false, msg: 'Erro interno ao listar utilizadores.' });
	}
};

const getUserById = async (req, res) => {
	try {
		const user = await userService.getUserById(req.params.id);
		if (!user)
			return res.status(404).json({ success: false, msg: 'Utilizador não encontrado.' });
		return res.status(200).json({ success: true, data: user });
	} catch (error) {
		logger.error('Erro ao obter utilizador:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const createUser = async (req, res) => {
	try {
		const existing = await userService.getUserByEmail(req.body.email);
		if (existing) return res.status(409).json({ success: false, msg: 'Email já registado.' });
		const user = await userService.createUser(req.body);
		return res.status(201).json({ success: true, data: user });
	} catch (error) {
		logger.error('Erro ao criar utilizador:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const updateUser = async (req, res) => {
	try {
		const user = await userService.updateUser(req.params.id, req.body);
		return res.status(200).json({ success: true, data: user });
	} catch (error) {
		logger.error('Erro ao atualizar utilizador:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const deleteUser = async (req, res) => {
	try {
		await userService.deleteUser(req.params.id);
		return res.status(200).json({ success: true, msg: 'Utilizador eliminado.' });
	} catch (error) {
		logger.error('Erro ao eliminar utilizador:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const updateUserRole = async (req, res) => {
	try {
		const { userId, role } = req.body;
		if (!userId || !role)
			return res.status(400).json({ success: false, msg: 'userId e role são obrigatórios.' });
		await userService.updateUserRole(userId, role);
		return res.status(200).json({ success: true, msg: 'Role atualizado.' });
	} catch (error) {
		logger.error('Erro ao atualizar role:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const toggleUserStatus = async (req, res) => {
	try {
		const { userId, status } = req.body;
		if (!userId || !status)
			return res
				.status(400)
				.json({ success: false, msg: 'userId e status são obrigatórios.' });
		await userService.toggleUserStatus(userId, status);
		return res.status(200).json({ success: true, msg: 'Status atualizado.' });
	} catch (error) {
		logger.error('Erro ao atualizar status:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

module.exports = {
	register,
	login,
	adminLogin,
	refreshToken,
	logout,
	logoutAll,
	isLoggedIn,
	requestPasswordReset,
	resetPassword,
	listUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	updateUserRole,
	toggleUserStatus
};
