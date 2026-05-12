if (process.env.NODE_ENV !== 'test') {
	require('dotenv').config();
}
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const routes = require('./routes/index.router');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middlewares/errors.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configs/swagger');

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const corsOptions = {
	origin: ['http://localhost:5173'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
};

// App setup
const app = express();

// Helmet — desativa CSP apenas na rota /docs
app.use((req, res, next) => {
	if (req.path.startsWith('/docs')) {
		return helmet({ contentSecurityPolicy: false })(req, res, next);
	}
	return helmet()(req, res, next);
});

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100,
	handler: (req, res /*next*/) => {
		return res.status(429).json({
			success: false,
			msg: 'Too many requests from this IP, please try again after 1 minute'
		});
	}
});
app.use(limiter);

// Swagger UI
app.use(
	'/docs',
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		customSiteTitle: 'RUI API Docs'
	})
);

// API routes
app.use('/', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
