const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
async function main() {
  const leaders = await p.user.findMany({
    where: {
      isDeleted: false,
      userRoles: { some: { role: { code: 'organization_leader' }, isDeleted: false } }
    },
    select: { userId: true, email: true, userName: true }
  })
  console.log('Org leaders:', JSON.stringify(leaders, null, 2))
}
main().finally(() => p.$disconnect())
