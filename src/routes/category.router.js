const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const middleware = require('../middlewares/auth.middleware');

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categorias]
 *     summary: Listar categorias
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/', categoryController.listCategories);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categorias]
 *     summary: Obter categoria por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categorias]
 *     summary: Criar categoria (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria criada
 *       409:
 *         description: Categoria já existe
 */
router.post(
	'/',
	middleware.requirePermission('categories:write'),
	categoryController.createCategory
);

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     tags: [Categorias]
 *     summary: Atualizar categoria (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada
 */
router.patch(
	'/:id',
	middleware.requirePermission('categories:write'),
	categoryController.updateCategory
);

router.delete(
	'/:id',
	middleware.requirePermission('categories:write'),
	categoryController.deleteCategory
);

module.exports = router;
