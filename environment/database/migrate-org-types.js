/**
 * Migration script: Remove club role, consolidate organizationType values.
 *
 * Changes:
 *  1. Convert organizationType: university/department/company → organization
 *  2. Move users with club role → organization_leader role
 *  3. Delete club role from Role table
 *
 * Run: node environment/database/migrate-org-types.js
 */

require("dotenv").config({ path: "./backend/.env" });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting org-type migration...");

  // 1. Convert old organizationType values to "organization"
  const updatedOrgs = await prisma.organization.updateMany({
    where: { organizationType: { in: ["university", "department", "company"] } },
    data: { organizationType: "organization" },
  });
  console.log(`  Updated ${updatedOrgs.count} organization(s) to type "organization"`);

  // 2. Find the club role
  const clubRole = await prisma.role.findFirst({ where: { code: "club" } });
  if (!clubRole) {
    console.log("  club role not found — skipping user role migration");
  } else {
    // 3. Find organization_leader role
    const orgLeaderRole = await prisma.role.findFirst({ where: { code: "organization_leader" } });
    if (!orgLeaderRole) throw new Error("organization_leader role not found");

    // 4. Move UserRole records from club → organization_leader (skip if already has org_leader)
    const clubUserRoles = await prisma.userRole.findMany({ where: { roleId: clubRole.roleId } });
    let moved = 0;
    for (const ur of clubUserRoles) {
      const alreadyHasOrgLeader = await prisma.userRole.findFirst({
        where: { userId: ur.userId, roleId: orgLeaderRole.roleId },
      });
      if (!alreadyHasOrgLeader) {
        await prisma.userRole.create({
          data: { userId: ur.userId, roleId: orgLeaderRole.roleId },
        });
        moved++;
      }
      await prisma.userRole.delete({
        where: { userId_roleId: { userId: ur.userId, roleId: clubRole.roleId } },
      });
    }
    console.log(`  Moved ${moved} user(s) from club → organization_leader`);

    // 5. Delete club role
    await prisma.role.delete({ where: { roleId: clubRole.roleId } });
    console.log("  Deleted club role");
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
