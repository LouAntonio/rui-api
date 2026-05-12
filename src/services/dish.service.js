const prisma = require('../configs/prisma.js');

const DAY_MAP = {
	0: 'SUNDAY',
	1: 'MONDAY',
	2: 'TUESDAY',
	3: 'WEDNESDAY',
	4: 'THURSDAY',
	5: 'FRIDAY',
	6: 'SATURDAY'
};

const listDishes = async ({ page = 1, limit = 20, search = '', categoryId, isActive } = {}) => {
	const skip = (Number(page) - 1) * Number(limit);
	const take = Number(limit);

	const where = {};

	if (search && search.trim() !== '') {
		where.OR = [
			{ name: { contains: search.trim(), mode: 'insensitive' } },
			{ description: { contains: search.trim(), mode: 'insensitive' } }
		];
	}

	if (categoryId) {
		where.categories = { some: { id: categoryId } };
	}

	if (isActive !== undefined) {
		where.isActive = isActive;
	}

	const [dishes, total] = await Promise.all([
		prisma.dish.findMany({
			where,
			skip,
			take,
			orderBy: { name: 'asc' },
			include: { categories: { select: { id: true, name: true } } }
		}),
		prisma.dish.count({ where })
	]);

	return {
		dishes,
		pagination: {
			total,
			page: Number(page),
			limit: take,
			totalPages: Math.ceil(total / take)
		}
	};
};

const getDishById = async (id) => {
	return prisma.dish.findUnique({
		where: { id },
		include: { categories: { select: { id: true, name: true } } }
	});
};

const getDishesByDate = async (dateStr) => {
	const date = dateStr ? new Date(dateStr) : new Date();
	const dayIndex = date.getDay();
	const dayEnum = DAY_MAP[dayIndex];

	const dishes = await prisma.dish.findMany({
		where: {
			isActive: true,
			availableDays: { has: dayEnum }
		},
		orderBy: { name: 'asc' },
		include: { categories: { select: { id: true, name: true } } }
	});

	return { dishes, date: dateStr || date.toISOString().split('T')[0], day: dayEnum };
};

const createDish = async (data) => {
	return prisma.dish.create({
		data: {
			...data,
			categories: data.categoryIds
				? { connect: data.categoryIds.map((id) => ({ id })) }
				: undefined
		},
		include: { categories: { select: { id: true, name: true } } }
	});
};

const updateDish = async (id, data) => {
	const { categoryIds, ...rest } = data;
	return prisma.dish.update({
		where: { id },
		data: {
			...rest,
			categories: categoryIds
				? { set: categoryIds.map((catId) => ({ id: catId })) }
				: undefined
		},
		include: { categories: { select: { id: true, name: true } } }
	});
};

const deleteDish = async (id) => {
	return prisma.dish.delete({ where: { id } });
};

module.exports = {
	listDishes,
	getDishById,
	getDishesByDate,
	createDish,
	updateDish,
	deleteDish
};
