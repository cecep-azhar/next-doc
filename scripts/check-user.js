const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'cecep.azhtech@gmail.com' }
    });

    if (!user) {
      console.log('❌ User NOT found in database!');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Has password:', !!user.password);
    console.log('   Password hash length:', user.password?.length || 0);

    // Test password comparison
    if (user.password) {
      const isValid = await bcrypt.compare('12345678', user.password);
      console.log('   Password "12345678" matches:', isValid);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
