const prisma = require('../configs/prisma.js');

const listCategories = async ({ page = 1, limit = 20, search = '' }) => {
	const skip = (Number(page) - 1) * Number(limit);
	const take = Number(limit);

	const where = {};
	if (search && search.trim() !== '') {
		where.name = { contains: search.trim(), mode: 'insensitive' };
	}

	const [categories, total] = await Promise.all([
		prisma.category.findMany({
			where,
			skip,
			take,
			orderBy: { name: 'asc' }
		}),
		prisma.category.count({ where })
	]);

	return {
		categories,
		pagination: {
			total,
			page: Number(page),
			limit: take,
			totalPages: Math.ceil(total / take)
		}
	};
};

const getCategoryById = async (id) => {
	return prisma.category.findUnique({ where: { id } });
};

const getCategoryByName = async (name) => {
	return prisma.category.findUnique({ where: { name } });
};

const createCategory = async (data) => {
	return prisma.category.create({ data });
};

const updateCategory = async (id, data) => {
	return prisma.category.update({ where: { id }, data });
};

const deleteCategory = async (id) => {
	return prisma.category.delete({ where: { id } });
};

module.exports = {
	listCategories,
	getCategoryById,
	getCategoryByName,
	createCategory,
	updateCategory,
	deleteCategory
};
