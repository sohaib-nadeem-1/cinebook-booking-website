export const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.userRole;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: "Access not authorized" });
  }
  return next();
};
