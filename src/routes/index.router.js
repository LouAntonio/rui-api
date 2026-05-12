const express = require('express');
const router = express.Router();
const userRoutes = require('./user.router.js');
const categoryRoutes = require('./category.router.js');
const dishRoutes = require('./dish.router.js');
const uploadRoutes = require('./upload.router.js');
const prisma = require('../configs/prisma');

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Geral
 *     summary: Estado da API
 *     responses:
 *       200:
 *         description: API online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 msg: { type: string, example: API online }
 *                 version: { type: string, example: 1.0.0 }
 */
router.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		msg: 'API online',
		version: '1.0.0'
	});
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Geral
 *     summary: Verificar saúde da API
 *     responses:
 *       200:
 *         description: API saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 msg: { type: string, example: API is healthy }
 *                 timestamp: { type: string, example: "2026-05-12T10:30:00.000Z" }
 *                 uptime: { type: string, example: "0 days, 0 hours, 5 minutes, 30 seconds" }
 *                 database: { type: string, example: connected }
 *                 memory: { type: object, properties: { used: { type: string, example: "45 MB" }, total: { type: string, example: "180 MB" } } }
 */
router.get('/health', async (_req, res) => {
	const start = Date.now();
	let database = 'disconnected';

	try {
		await prisma.$queryRaw`SELECT 1`;
		database = 'connected';
	} catch (err) {
		database = 'disconnected';
	}

	const uptimeSec = Math.floor(process.uptime());
	let sec = uptimeSec;
	const days = Math.floor(sec / 86400);
	sec -= days * 86400;
	const hours = Math.floor(sec / 3600);
	sec -= hours * 3600;
	const minutes = Math.floor(sec / 60);
	sec -= minutes * 60;

	const mem = process.memoryUsage();
	const toMB = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

	const response = {
		success: true,
		msg: 'API is healthy',
		timestamp: new Date().toISOString(),
		uptime: `${days} days, ${hours} hours, ${minutes} minutes, ${sec} seconds`,
		database,
		memory: {
			used: toMB(mem.heapUsed),
			total: toMB(mem.heapTotal)
		}
	};

	const latency = Date.now() - start;
	if (latency > 1000) {
		response.warning = 'High response latency detected';
	}

	console.log(`Latency: ${latency} ms`);

	return res.status(200).json(response);
});

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/dishes', dishRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
