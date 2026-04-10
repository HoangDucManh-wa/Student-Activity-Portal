const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const p = new PrismaClient()
async function m() {
  const org = await p.organization.findFirst({
    where: { email: 'dat2801zz@gmail.comzzz' },
    select: { organizationId: true, password: true }
  })
  console.log('Has password field:', !!org.password)
  console.log('Password length:', org.password ? org.password.length : 0)
  console.log('Password starts with:', org.password ? org.password.substring(0, 10) : 'N/A')

  // Test bcrypt
  const hash = org.password || ''
  const match = await bcrypt.compare('Test@123456', hash)
  console.log('bcrypt compare result:', match)
}
m().finally(() => p.$disconnect())
