const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/configs/prisma');

describe('Auth Routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('POST /users/register', () => {
		it('should register a new user', async () => {
			prisma.user.findUnique.mockResolvedValue(null);
			prisma.user.create.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test',
				surname: 'User',
				role: 'SELLER',
				status: 'ACTIVE'
			});

			const res = await request(app).post('/users/register').send({
				name: 'Test',
				surname: 'User',
				email: 'test@example.com',
				password: 'password123'
			});

			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
		});

		it('should return 409 if email already exists', async () => {
			prisma.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com'
			});

			const res = await request(app).post('/users/register').send({
				name: 'Test',
				surname: 'User',
				email: 'test@example.com',
				password: 'password123'
			});

			expect(res.status).toBe(409);
		});

		it('should return 400 if required fields are missing', async () => {
			const res = await request(app).post('/users/register').send({ name: 'Test' });

			expect(res.status).toBe(400);
		});
	});

	describe('POST /users/login', () => {
		it('should return 401 with non-existent user', async () => {
			prisma.user.findUnique.mockResolvedValue(null);

			const res = await request(app).post('/users/login').send({
				email: 'test@example.com',
				password: 'password123'
			});

			expect(res.status).toBe(401);
		});

		it('should return 401 with invalid credentials', async () => {
			prisma.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				password: 'hashedpassword',
				status: 'ACTIVE',
				role: 'SELLER'
			});

			const res = await request(app).post('/users/login').send({
				email: 'test@example.com',
				password: 'wrongpassword'
			});

			expect(res.status).toBe(401);
		});
	});

	describe('POST /users/logout', () => {
		it('should return 401 without authentication', async () => {
			const res = await request(app).post('/users/logout');

			expect(res.status).toBe(401);
		});
	});

	describe('GET /users/is-logged-in', () => {
		it('should return 401 without token', async () => {
			const res = await request(app).get('/users/is-logged-in');

			expect(res.status).toBe(401);
		});
	});

	describe('POST /users/refresh-token', () => {
		it('should return 401 without refresh token', async () => {
			const res = await request(app).post('/users/refresh-token');

			expect(res.status).toBe(401);
		});
	});
});
