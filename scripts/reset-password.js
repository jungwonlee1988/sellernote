const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const newPassword = 'admin1234';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email: 'jungwon.lee@seller-note.com' },
    data: { password: hashedPassword },
    select: { id: true, email: true, name: true }
  });

  console.log('비밀번호 변경 완료:', user.email);
  console.log('새 비밀번호:', newPassword);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
