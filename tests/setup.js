jest.mock('../src/configs/prisma', () => require('../src/__mocks__/prisma'));

if (process.env.NODE_ENV !== 'test') {
	process.env.NODE_ENV = 'test';
}

process.env.PORT = process.env.PORT || '20262';
process.env.TZ = process.env.TZ || 'Africa/Luanda';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';
process.env.JWT_USERSECRET = process.env.JWT_USERSECRET || 'test-jwt-secret-key-for-testing';
process.env.JWT_ADMIN_SECRET =
	process.env.JWT_ADMIN_SECRET || 'test-admin-jwt-secret-key-for-testing';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 'test-resend-key';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-api-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-api-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:20262';

jest.setTimeout(30000);
