const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Server API',
			version: '1.0.0',
			description: 'API Docs'
		},
		servers: [
			{
				url: `${process.env.BACKEND_URL}`,
				description: 'Servidor Online'
			},
			{
				url: `http://localhost:${process.env.PORT}`,
				description: 'Servidor Local'
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			},
			schemas: {
				Error: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: false },
						msg: { type: 'string' }
					}
				}
			}
		}
	},
	apis: [path.join(__dirname, '../routes/*.js')]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
