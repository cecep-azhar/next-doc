import { db } from '../lib/db';

async function updateDemoToPro() {
  try {
    console.log('🔄 Updating demo tenant to PRO plan...');
    
    const updated = await db.tenant.update({
      where: { slug: 'demo' },
      data: { plan: 'PRO' },
    });
    
    console.log('✅ Demo tenant updated to PRO!');
    console.log('   Name:', updated.name);
    console.log('   Slug:', updated.slug);
    console.log('   Plan:', updated.plan);
    
    // Show all tenants
    const tenants = await db.tenant.findMany({
      select: { slug: true, name: true, plan: true },
    });
    
    console.log('\n📊 All tenants:');
    tenants.forEach(t => {
      console.log(`   ${t.slug} (${t.name}) - ${t.plan}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

updateDemoToPro();
