const categoryService = require('../services/category.service.js');
const logger = require('../utils/logger.util.js');

const listCategories = async (req, res) => {
	try {
		const result = await categoryService.listCategories(req.query);
		return res.status(200).json({ success: true, data: result });
	} catch (error) {
		logger.error('Erro ao listar categorias:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const getCategoryById = async (req, res) => {
	try {
		const category = await categoryService.getCategoryById(req.params.id);
		if (!category)
			return res.status(404).json({ success: false, msg: 'Categoria não encontrada.' });
		return res.status(200).json({ success: true, data: category });
	} catch (error) {
		logger.error('Erro ao obter categoria:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const createCategory = async (req, res) => {
	try {
		const existing = await categoryService.getCategoryByName(req.body.name);
		if (existing) return res.status(409).json({ success: false, msg: 'Categoria já existe.' });
		const category = await categoryService.createCategory(req.body);
		return res.status(201).json({ success: true, data: category });
	} catch (error) {
		logger.error('Erro ao criar categoria:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const updateCategory = async (req, res) => {
	try {
		const category = await categoryService.updateCategory(req.params.id, req.body);
		return res.status(200).json({ success: true, data: category });
	} catch (error) {
		logger.error('Erro ao atualizar categoria:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const deleteCategory = async (req, res) => {
	try {
		await categoryService.deleteCategory(req.params.id);
		return res.status(200).json({ success: true, msg: 'Categoria eliminada.' });
	} catch (error) {
		logger.error('Erro ao eliminar categoria:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

module.exports = {
	listCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory
};
