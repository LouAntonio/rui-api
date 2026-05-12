const PERMISSIONS = {
	ADMIN: ['*'],
	SELLER: ['dishes:read', 'categories:read']
};

const requirePermission = (...permissions) => {
	return (req, res, next) => {
		const { role } = req.user || {};
		const userPerms = PERMISSIONS[role] || [];
		const hasAccess =
			userPerms.includes('*') || permissions.every((p) => userPerms.includes(p));
		if (!hasAccess) {
			return res.status(403).json({ success: false, msg: 'Acesso negado.' });
		}
		next();
	};
};

module.exports = { PERMISSIONS, requirePermission };
