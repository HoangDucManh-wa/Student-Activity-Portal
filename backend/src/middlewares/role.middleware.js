const AppError = require("../utils/app-error");
const prisma = require("../config/prisma");

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new AppError("FORBIDDEN");
    }
    next();
  };
};

// Checks organizationType of the user's organization (club or organization).
// Must be used after authorize("organization_leader").
const authorizeOrgType = (...allowedTypes) => {
  return async (req, res, next) => {
    try {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: req.user.userId, isDeleted: false },
        include: { organization: { select: { organizationType: true, organizationId: true } } },
        orderBy: { joinDate: "desc" },
      });
      if (!member || !allowedTypes.includes(member.organization.organizationType)) {
        throw new AppError("FORBIDDEN");
      }
      req.orgType = member.organization.organizationType;
      req.organizationId = member.organization.organizationId;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { authorize, authorizeOrgType };
