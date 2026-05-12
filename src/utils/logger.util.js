const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

const currentDate = new Date().toISOString().split('T')[0];

const logger = winston.createLogger({
	level: 'silly', // captura todos os níveis
	levels: winston.config.npm.levels,
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level.toUpperCase()}]: ${message}`;
		})
	),
	transports: [
		// Arquivo de erros
		new winston.transports.File({
			filename: path.join(logDir, `error-${currentDate}.log`),
			level: 'error'
		}),
		// Arquivo com todos os logs
		new winston.transports.File({
			filename: path.join(logDir, `all-${currentDate}.log`)
		}),
		// Console com cores
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.simple())
		})
	],
	exitOnError: false
});

module.exports = logger;
