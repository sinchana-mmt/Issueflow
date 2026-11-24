import { hashPassword } from "better-auth/crypto";
import { DEFAULT_USER_PASSWORD } from "../src/lib/constants";
import { prisma } from "../src/lib/prisma";

const previousRole: Record<string, string> = {
  MEMBER: "USER",
  MANAGER: "ADMIN",
  ADMIN: "SUPERADMIN",
};

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  for (const user of users) {
    const role = previousRole[user.role];
    if (role) await prisma.user.update({ where: { id: user.id }, data: { role } });
  }
  const superPassword = await hashPassword("MysoreMinds1@3");
  const userPassword = await hashPassword(DEFAULT_USER_PASSWORD);
  const superadmin = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
  if (superadmin) {
    await prisma.user.update({
      where: { id: superadmin.id },
      data: { role: "SUPERADMIN", name: "Superadmin", active: true },
    });
    await prisma.account.updateMany({
      where: { userId: superadmin.id, providerId: "credential" },
      data: { password: superPassword },
    });
  }
  const others = users.filter((user) => user.id !== superadmin?.id);
  for (const user of others) {
    await prisma.account.updateMany({
      where: { userId: user.id, providerId: "credential" },
      data: { password: userPassword },
    });
  }
  console.log("Roles and passwords updated");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
