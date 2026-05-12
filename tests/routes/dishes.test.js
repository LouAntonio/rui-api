const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/configs/prisma');

describe('Dish Routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('GET /dishes', () => {
		it('should return list of dishes', async () => {
			prisma.dish.findMany.mockResolvedValue([
				{ id: 'dish-1', name: 'Dish 1', price: 10.0, isActive: true },
				{ id: 'dish-2', name: 'Dish 2', price: 15.0, isActive: true }
			]);
			prisma.dish.count.mockResolvedValue(2);

			const res = await request(app).get('/dishes');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(Array.isArray(res.body.data.dishes)).toBe(true);
		});

		it('should filter dishes by category', async () => {
			prisma.dish.findMany.mockResolvedValue([]);
			prisma.dish.count.mockResolvedValue(0);

			const res = await request(app).get('/dishes').query({ categoryId: 'cat-1' });

			expect(res.status).toBe(200);
		});

		it('should filter dishes by search term', async () => {
			prisma.dish.findMany.mockResolvedValue([]);
			prisma.dish.count.mockResolvedValue(0);

			const res = await request(app).get('/dishes').query({ search: 'pizza' });

			expect(res.status).toBe(200);
		});

		it('should filter dishes by isActive', async () => {
			prisma.dish.findMany.mockResolvedValue([]);
			prisma.dish.count.mockResolvedValue(0);

			const res = await request(app).get('/dishes').query({ isActive: true });

			expect(res.status).toBe(200);
		});
	});

	describe('GET /dishes/by-date', () => {
		it('should return dishes for specific date', async () => {
			prisma.dish.findMany.mockResolvedValue([]);

			const res = await request(app).get('/dishes/by-date').query({ date: '2026-05-12' });

			expect(res.status).toBe(200);
		});

		it('should return dishes for current date without param', async () => {
			prisma.dish.findMany.mockResolvedValue([]);

			const res = await request(app).get('/dishes/by-date');

			expect(res.status).toBe(200);
		});
	});

	describe('GET /dishes/:id', () => {
		it('should return dish by id', async () => {
			prisma.dish.findUnique.mockResolvedValue({
				id: 'dish-1',
				name: 'Test Dish',
				price: 10.0
			});

			const res = await request(app).get('/dishes/dish-1');

			expect(res.status).toBe(200);
			expect(res.body.data.name).toBe('Test Dish');
		});

		it('should return 404 for non-existent dish', async () => {
			prisma.dish.findUnique.mockResolvedValue(null);

			const res = await request(app).get('/dishes/non-existent');

			expect(res.status).toBe(404);
		});
	});

	describe('POST /dishes', () => {
		it('should return 403 without authentication', async () => {
			const res = await request(app).post('/dishes').send({ name: 'New Dish', price: 10.0 });

			expect(res.status).toBe(403);
		});

		it('should return 403 without proper role', async () => {
			const jwt = require('jsonwebtoken');
			const token = jwt.sign(
				{ userId: 'user-1', role: 'SELLER' },
				'test-jwt-secret-key-for-testing'
			);

			const res = await request(app)
				.post('/dishes')
				.set('Authorization', `Bearer ${token}`)
				.send({ name: 'New Dish', price: 10.0 });

			expect(res.status).toBe(403);
		});
	});

	describe('PATCH /dishes/:id', () => {
		it('should return 403 without authentication', async () => {
			const res = await request(app).patch('/dishes/dish-1').send({ name: 'Updated Dish' });

			expect(res.status).toBe(403);
		});
	});

	describe('DELETE /dishes/:id', () => {
		it('should return 403 without authentication', async () => {
			const res = await request(app).delete('/dishes/dish-1');

			expect(res.status).toBe(403);
		});
	});
});
