const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "info", "warn", "query"],
});

module.exports = prisma;
