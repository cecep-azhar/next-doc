import { db } from '../lib/db';

async function seedTeamMembers() {
  try {
    console.log('🌱 Seeding team members...\n');

    // Get demo tenant and users
    const tenant = await db.tenant.findUnique({
      where: { slug: 'demo' },
    });

    if (!tenant) {
      console.log('❌ Demo tenant not found!');
      return;
    }

    const superadmin = await db.user.findUnique({
      where: { email: 'cecep.azhtech@gmail.com' },
    });

    const demoUser = await db.user.findUnique({
      where: { email: 'user@example.com' },
    });

    if (!superadmin || !demoUser) {
      console.log('❌ Users not found!');
      return;
    }

    // Check if members already exist
    const existingMembers = await db.tenantMember.findMany({
      where: { tenantId: tenant.id },
    });

    if (existingMembers.length > 0) {
      console.log('✅ Team members already exist!');
      existingMembers.forEach(m => {
        console.log(`   - Role: ${m.role}, User ID: ${m.userId}`);
      });
      return;
    }

    // Create team members
    const owner = await db.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: superadmin.id,
        role: 'OWNER',
      },
    });

    const editor = await db.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: demoUser.id,
        role: 'EDITOR',
      },
    });

    console.log('✅ Team members created!');
    console.log(`   - OWNER: ${superadmin.email}`);
    console.log(`   - EDITOR: ${demoUser.email}\n`);

    // Show summary
    const allMembers = await db.tenantMember.findMany({
      where: { tenantId: tenant.id },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    console.log('📊 Team Summary:');
    console.log(`   Tenant: ${tenant.name}`);
    console.log(`   Total Members: ${allMembers.length}`);
    allMembers.forEach(m => {
      console.log(`   - ${m.role}: ${m.user.name} (${m.user.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

seedTeamMembers();
