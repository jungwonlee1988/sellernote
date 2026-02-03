const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'jungwon.lee@seller-note.com' },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('권한 변경 완료:', JSON.stringify(user, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
