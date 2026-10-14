const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { getDrugDetailsAI } = require('./dist/services/aiService');

async function testCacheHit() {
  console.log("=========================================");
  console.log("TESTING CACHE HIT FOR ANTINAL...");
  console.log("=========================================");
  console.log("This should load instantly from Supabase (without calling Gemini AI API)...");

  const start = Date.now();
  try {
    const details = await getDrugDetailsAI('Antinal');
    const duration = Date.now() - start;
    console.log(`\n[SUCCESS] Loaded details in ${duration}ms!`);
    console.log("Antinal scientific name:", details.openfda?.generic_name?.[0]);
  } catch (error) {
    console.error("Test failed:", error.message || error);
  }
}

testCacheHit();
