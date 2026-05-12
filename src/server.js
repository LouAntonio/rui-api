const app = require('./app');
const logger = require('./utils/logger.util');

const PORT = process.env.PORT || 20260;
const URL =
	process.env.NODE_ENV === 'development' ? `http://localhost:${PORT}` : process.env.BACKEND_URL;

const server = app.listen(PORT, '0.0.0.0', () => {
	logger.info(`API online at ${URL}`);
	logger.info(`Health check route: ${URL}/health`);
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received: closing server!');
	process.exit(0);
});

process.on('SIGINT', async () => {
	logger.info('SIGINT signal received: closing server!');
	process.exit(0);
});

module.exports = server;
