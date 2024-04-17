const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateId() {
  let id;
  let isUnique = false;
  
  do {
    id = 'SE' + uuidv4().substring(0, 3);

    const existingId = await prisma.service.findFirst({
      where: { id }
    });
    
    if (!existingId) {
      isUnique = true;
    }
  } while (!isUnique);
  
  return id;
}

module.exports = { generateId }