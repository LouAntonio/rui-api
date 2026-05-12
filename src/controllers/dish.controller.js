const dishService = require('../services/dish.service.js');
const logger = require('../utils/logger.util.js');

const listDishes = async (req, res) => {
	try {
		const result = await dishService.listDishes(req.query);
		return res.status(200).json({ success: true, data: result });
	} catch (error) {
		logger.error('Erro ao listar pratos:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const getDishById = async (req, res) => {
	try {
		const dish = await dishService.getDishById(req.params.id);
		if (!dish) return res.status(404).json({ success: false, msg: 'Prato não encontrado.' });
		return res.status(200).json({ success: true, data: dish });
	} catch (error) {
		logger.error('Erro ao obter prato:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const getDishesByDate = async (req, res) => {
	try {
		const { date } = req.query;
		const result = await dishService.getDishesByDate(date);
		return res.status(200).json({ success: true, data: result });
	} catch (error) {
		logger.error('Erro ao listar pratos por data:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const createDish = async (req, res) => {
	try {
		const dish = await dishService.createDish(req.body);
		return res.status(201).json({ success: true, data: dish });
	} catch (error) {
		logger.error('Erro ao criar prato:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const updateDish = async (req, res) => {
	try {
		const dish = await dishService.updateDish(req.params.id, req.body);
		return res.status(200).json({ success: true, data: dish });
	} catch (error) {
		logger.error('Erro ao atualizar prato:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

const deleteDish = async (req, res) => {
	try {
		await dishService.deleteDish(req.params.id);
		return res.status(200).json({ success: true, msg: 'Prato eliminado.' });
	} catch (error) {
		logger.error('Erro ao eliminar prato:', error);
		return res.status(500).json({ success: false, msg: 'Erro interno.' });
	}
};

module.exports = {
	listDishes,
	getDishById,
	getDishesByDate,
	createDish,
	updateDish,
	deleteDish
};
