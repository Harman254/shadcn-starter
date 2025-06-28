// Script to fix negative generation counts in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixNegativeCounts() {
  try {
    console.log('🔍 Checking for negative generation counts...');
    
    // Find all records with negative counts
    const negativeRecords = await prisma.mealPlanGeneration.findMany({
      where: {
        generationCount: {
          lt: 0
        }
      }
    });
    
    console.log(`Found ${negativeRecords.length} records with negative counts`);
    
    if (negativeRecords.length > 0) {
      console.log('📝 Records with negative counts:');
      negativeRecords.forEach(record => {
        console.log(`  User: ${record.userId}, Count: ${record.generationCount}, Week: ${record.weekStart}`);
      });
      
      // Fix all negative counts
      const result = await prisma.mealPlanGeneration.updateMany({
        where: {
          generationCount: {
            lt: 0
          }
        },
        data: {
          generationCount: 0
        }
      });
      
      console.log(`✅ Fixed ${result.count} negative generation counts`);
    } else {
      console.log('✅ No negative counts found');
    }
    
    // Also check for counts over the limit
    const overLimitRecords = await prisma.mealPlanGeneration.findMany({
      where: {
        generationCount: {
          gt: 2
        }
      }
    });
    
    console.log(`Found ${overLimitRecords.length} records over the limit (2)`);
    
    if (overLimitRecords.length > 0) {
      console.log('📝 Records over limit:');
      overLimitRecords.forEach(record => {
        console.log(`  User: ${record.userId}, Count: ${record.generationCount}, Week: ${record.weekStart}`);
      });
      
      // Cap counts at the limit
      const result = await prisma.mealPlanGeneration.updateMany({
        where: {
          generationCount: {
            gt: 2
          }
        },
        data: {
          generationCount: 2
        }
      });
      
      console.log(`✅ Capped ${result.count} counts at the limit (2)`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing negative counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixNegativeCounts(); 