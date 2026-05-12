const prisma = require('../configs/prisma.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const listUsers = async ({ page = 1, limit = 20, search = '', status, role }) => {
	const skip = (Number(page) - 1) * Number(limit);
	const take = Number(limit);

	const where = {};

	if (search && search.trim() !== '') {
		const term = search.trim();
		where.OR = [
			{ name: { contains: term, mode: 'insensitive' } },
			{ surname: { contains: term, mode: 'insensitive' } },
			{ email: { contains: term, mode: 'insensitive' } }
		];
	}

	if (status) where.status = status;
	if (role) where.role = role;

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip,
			take,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				surname: true,
				email: true,
				role: true,
				status: true,
				lastLogin: true,
				createdAt: true,
				updatedAt: true
			}
		}),
		prisma.user.count({ where })
	]);

	return {
		users,
		pagination: {
			total,
			page: Number(page),
			limit: take,
			totalPages: Math.ceil(total / take)
		}
	};
};

const getUserById = async (id) => {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			surname: true,
			email: true,
			role: true,
			status: true,
			lastLogin: true,
			createdAt: true,
			updatedAt: true
		}
	});
};

const getUserByEmail = async (email) => {
	return prisma.user.findUnique({ where: { email } });
};

const register = async ({ name, surname, email, password }) => {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		throw Object.assign(new Error('Email já registado.'), { statusCode: 409 });
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	const user = await prisma.user.create({
		data: { name, surname, email, password: hashedPassword, lastLogin: new Date() }
	});

	return user;
};

const updateUser = async (id, data) => {
	const updateData = { ...data };
	if (data.password) {
		updateData.password = await bcrypt.hash(data.password, 12);
	}
	return prisma.user.update({ where: { id }, data: updateData });
};

const updateUserRole = async (id, role) => {
	return prisma.user.update({ where: { id }, data: { role } });
};

const toggleUserStatus = async (id, status) => {
	return prisma.user.update({ where: { id }, data: { status } });
};

const deleteUser = async (id) => {
	return prisma.user.delete({ where: { id } });
};

const verifyPassword = async (plainPassword, hashedPassword) => {
	return bcrypt.compare(plainPassword, hashedPassword);
};

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_USER_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateAdminAccessToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_ADMIN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = async (userId) => {
	const token = require('crypto').randomUUID();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
	await prisma.refreshToken.create({
		data: { token, userId, expiresAt }
	});
	return token;
};

const verifyAccessToken = (token) => {
	return jwt.verify(token, process.env.JWT_USER_SECRET);
};

const verifyAdminAccessToken = (token) => {
	return jwt.verify(token, process.env.JWT_ADMIN_SECRET);
};

const verifyRefreshToken = async (token) => {
	const rt = await prisma.refreshToken.findUnique({ where: { token } });
	if (!rt) return null;
	if (rt.expiresAt < new Date()) {
		await prisma.refreshToken.delete({ where: { token } });
		return null;
	}
	return rt;
};

const revokeRefreshToken = async (token) => {
	await prisma.refreshToken.deleteMany({ where: { token } });
};

const revokeAllUserRefreshTokens = async (userId) => {
	await prisma.refreshToken.deleteMany({ where: { userId } });
};

const cleanExpiredTokens = async () => {
	await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
};

const generateTokensForUser = async (user, isAdmin = false) => {
	const secret = isAdmin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_USER_SECRET;
	const accessToken = jwt.sign({ id: user.id, role: user.role }, secret, {
		expiresIn: ACCESS_TOKEN_EXPIRY
	});
	const refreshToken = await generateRefreshToken(user.id);
	return { accessToken, refreshToken, expiresIn: 900 };
};

const updateLastLogin = async (id) => {
	return prisma.user.update({ where: { id }, data: { lastLogin: new Date() } });
};

module.exports = {
	listUsers,
	getUserById,
	getUserByEmail,
	register,
	updateUser,
	updateUserRole,
	toggleUserStatus,
	deleteUser,
	verifyPassword,
	generateAccessToken,
	generateAdminAccessToken,
	generateTokensForUser,
	verifyAccessToken,
	verifyAdminAccessToken,
	verifyRefreshToken,
	revokeRefreshToken,
	revokeAllUserRefreshTokens,
	cleanExpiredTokens,
	updateLastLogin
};
