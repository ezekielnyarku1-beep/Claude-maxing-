import { prisma } from '../src/db.js'

const email = process.argv[2]?.trim().toLowerCase()

try {
  if (!email) {
    throw new Error('Write the email after the command, like this: npm run make-admin -- you@example.com')
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error(`No user with the email ${email}. Sign in to the app once with that email, then run this again.`)
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } })
  console.log(`${user.name} (${email}) is now an admin.`)
} finally {
  await prisma.$disconnect()
}
