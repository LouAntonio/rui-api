const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dish.controller');
const { upload, uploadImage } = require('../middlewares/upload.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');

/**
 * @openapi
 * /dishes:
 *   get:
 *     tags: [Pratos]
 *     summary: Listar pratos
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
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de pratos
 */
router.get('/', dishController.listDishes);

/**
 * @openapi
 * /dishes/by-date:
 *   get:
 *     tags: [Pratos]
 *     summary: Listar pratos disponíveis para uma data
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Data no formato YYYY-MM-DD. Se omitido, usa o dia atual.
 *     responses:
 *       200:
 *         description: Lista de pratos disponíveis para o dia
 */
router.get('/by-date', dishController.getDishesByDate);

/**
 * @openapi
 * /dishes/{id}:
 *   get:
 *     tags: [Pratos]
 *     summary: Obter prato por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Prato encontrado
 *       404:
 *         description: Prato não encontrado
 */
router.get('/:id', dishController.getDishById);

/**
 * @openapi
 * /dishes:
 *   post:
 *     tags: [Pratos]
 *     summary: Criar prato (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               categoryIds:
 *                 type: array
 *                 items: { type: string }
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *     responses:
 *       201:
 *         description: Prato criado
 */
router.post('/', requirePermission('dishes:write'), dishController.createDish);

router.patch('/:id', requirePermission('dishes:write'), dishController.updateDish);

router.delete('/:id', requirePermission('dishes:write'), dishController.deleteDish);

router.post(
	'/upload-image',
	requirePermission('dishes:write'),
	upload.single('image'),
	uploadImage
);

module.exports = router;
