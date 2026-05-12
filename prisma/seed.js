const prisma = require('../src/configs/prisma.js');
const bcrypt = require('bcrypt');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@local.test';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_SURNAME = process.env.ADMIN_SURNAME || 'User';

const seedAdmin = async () => {
	const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

	await prisma.user.upsert({
		where: { email: ADMIN_EMAIL },
		update: {
			name: ADMIN_NAME,
			surname: ADMIN_SURNAME,
			password: hashedPassword,
			role: 'ADMIN',
			status: 'ACTIVE',
			lastLogin: new Date()
		},
		create: {
			name: ADMIN_NAME,
			surname: ADMIN_SURNAME,
			email: ADMIN_EMAIL,
			password: hashedPassword,
			role: 'ADMIN',
			status: 'ACTIVE',
			lastLogin: new Date()
		}
	});
};

seedAdmin()
	.then(() => {
		console.log('Admin seed concluido.');
	})
	.catch((error) => {
		console.error('Falha ao executar seed do admin:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
