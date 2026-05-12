const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/configs/prisma');

describe('Category Routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('GET /categories', () => {
		it('should return list of categories', async () => {
			prisma.category.findMany.mockResolvedValue([
				{ id: 'cat-1', name: 'Category 1' },
				{ id: 'cat-2', name: 'Category 2' }
			]);
			prisma.category.count.mockResolvedValue(2);

			const res = await request(app).get('/categories');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(Array.isArray(res.body.data.categories)).toBe(true);
		});

		it('should filter categories by search term', async () => {
			prisma.category.findMany.mockResolvedValue([]);
			prisma.category.count.mockResolvedValue(0);

			const res = await request(app).get('/categories').query({ search: 'pizza' });

			expect(res.status).toBe(200);
		});
	});

	describe('GET /categories/:id', () => {
		it('should return category by id', async () => {
			prisma.category.findUnique.mockResolvedValue({
				id: 'cat-1',
				name: 'Test Category'
			});

			const res = await request(app).get('/categories/cat-1');

			expect(res.status).toBe(200);
			expect(res.body.data.name).toBe('Test Category');
		});

		it('should return 404 for non-existent category', async () => {
			prisma.category.findUnique.mockResolvedValue(null);

			const res = await request(app).get('/categories/non-existent');

			expect(res.status).toBe(404);
		});
	});

	describe('POST /categories', () => {
		it('should return 403 without authentication', async () => {
			const res = await request(app).post('/categories').send({ name: 'New Category' });

			expect(res.status).toBe(403);
		});

		it('should return 403 without admin role', async () => {
			const jwt = require('jsonwebtoken');
			const token = jwt.sign(
				{ userId: 'user-1', role: 'SELLER' },
				'test-jwt-secret-key-for-testing'
			);

			const res = await request(app)
				.post('/categories')
				.set('Authorization', `Bearer ${token}`)
				.send({ name: 'New Category' });

			expect(res.status).toBe(403);
		});
	});

	describe('PATCH /categories/:id', () => {
		it('should return 403 without authentication', async () => {
			const res = await request(app)
				.patch('/categories/cat-1')
				.send({ name: 'Updated Category' });

			expect(res.status).toBe(403);
		});
	});

	describe('DELETE /categories/:id', () => {
		it('should return 403 without authentication', async () => {
			const res = await request(app).delete('/categories/cat-1');

			expect(res.status).toBe(403);
		});
	});
});
