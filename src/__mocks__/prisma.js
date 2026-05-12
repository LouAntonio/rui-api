const mockPrisma = {
	user: {
		findUnique: jest.fn(),
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn()
	},
	refreshToken: {
		findFirst: jest.fn(),
		create: jest.fn(),
		delete: jest.fn(),
		deleteMany: jest.fn()
	},
	dish: {
		findUnique: jest.fn(),
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn(),
		count: jest.fn()
	},
	category: {
		findUnique: jest.fn(),
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn(),
		count: jest.fn()
	}
};

module.exports = mockPrisma;
module.exports.default = mockPrisma;
