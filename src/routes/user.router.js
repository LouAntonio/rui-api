const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requirePermission } = require('../middlewares/rbac.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @openapi
 * tags:
 *   - name: Autenticação
 *     description: Registo e login de utilizadores
 *   - name: Utilizadores
 *     description: Gestão de utilizadores (Admin)
 */

// ─── Registo ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Registar novo utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, surname, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Utilizador registado com sucesso
 *       409:
 *         description: Email já registado
 */
router.post('/register', userController.register);

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Login de utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna token JWT
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas de login
 */
router.post('/login', authMiddleware.loginLimiter, userController.login);

/**
 * @openapi
 * /users/admin/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Login de administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login admin bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Acesso negado
 */
router.post('/admin/login', authMiddleware.loginLimiter, userController.adminLogin);

// ─── Recuperação de senha ─────────────────────────────────────────────────────

/**
 * @openapi
 * /users/request-password-reset:
 *   post:
 *     tags: [Autenticação]
 *     summary: Solicitar reset de senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de reset enviado
 */
router.post('/request-password-reset', userController.requestPasswordReset);

/**
 * @openapi
 * /users/reset-password:
 *   post:
 *     tags: [Autenticação]
 *     summary: Redefinir senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/reset-password', userController.resetPassword);

// ─── Gestão de utilizadores ───────────────────────────────────────────────────

/**
 * @openapi
 * /users/list:
 *   post:
 *     tags: [Utilizadores]
 *     summary: Listar utilizadores (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 default: 20
 *               search:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SELLER]
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 */
router.post(
	'/list',
	authMiddleware.isAdmin,
	requirePermission('users:read'),
	userController.listUsers
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Utilizadores]
 *     summary: Obter utilizador por ID (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilizador encontrado
 */
router.get(
	'/:id',
	authMiddleware.isAdmin,
	requirePermission('users:read'),
	userController.getUserById
);

/**
 * @openapi
 * /users/toggle-status:
 *   patch:
 *     tags: [Utilizadores]
 *     summary: Ativar/suspender utilizador (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.patch(
	'/toggle-status',
	authMiddleware.isAdmin,
	requirePermission('users:write'),
	userController.toggleUserStatus
);

/**
 * @openapi
 * /users/update-role:
 *   patch:
 *     tags: [Utilizadores]
 *     summary: Alterar role de utilizador (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, role]
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SELLER]
 *     responses:
 *       200:
 *         description: Role atualizado
 */
router.patch(
	'/update-role',
	authMiddleware.isAdmin,
	requirePermission('users:write'),
	userController.updateUserRole
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Utilizadores]
 *     summary: Atualizar utilizador (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilizador atualizado
 */
router.patch(
	'/:id',
	authMiddleware.isAdmin,
	requirePermission('users:write'),
	userController.updateUser
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Utilizadores]
 *     summary: Eliminar utilizador (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilizador eliminado
 */
router.delete(
	'/:id',
	authMiddleware.isAdmin,
	requirePermission('users:write'),
	userController.deleteUser
);

// ─── Sessão ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /users/is-logged-in:
 *   get:
 *     tags: [Autenticação]
 *     summary: Verificar se o utilizador está autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de autenticação
 */
router.get('/is-logged-in', authMiddleware.optionalAuth, userController.isLoggedIn);

/**
 * @openapi
 * /users/admin/is-logged-in:
 *   get:
 *     tags: [Autenticação]
 *     summary: Verificar se o administrador está autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de autenticação do admin
 */
router.get('/admin/is-logged-in', authMiddleware.optionalAdminAuth, userController.isLoggedIn);

/**
 * @openapi
 * /users/refresh-token:
 *   post:
 *     tags: [Autenticação]
 *     summary: Renovar access token usando refresh token (httpOnly cookie)
 *     responses:
 *       200:
 *         description: Novo access token gerado
 *       401:
 *         description: Refresh token inválido ou expirado
 */
router.post('/refresh-token', userController.refreshToken);

/**
 * @openapi
 * /users/logout:
 *   post:
 *     tags: [Autenticação]
 *     summary: Logout (revoga refresh token atual)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout efetuado
 */
router.post('/logout', authMiddleware.isAdmin, userController.logout);

/**
 * @openapi
 * /users/logout-all:
 *   post:
 *     tags: [Autenticação]
 *     summary: Logout global (revoga todos os refresh tokens)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout global efetuado
 */
router.post('/logout-all', authMiddleware.isAdmin, userController.logoutAll);

module.exports = router;
