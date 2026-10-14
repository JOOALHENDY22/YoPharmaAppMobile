const dotenv = require('dotenv');
const path = require('path');

// Load environment variables immediately as the absolute first step!
dotenv.config();

const { getDrugDetailsAI } = require('./dist/services/aiService');

async function runTests() {
  console.log("=========================================");
  console.log("STARTING TEST: Gemini Key Rotation");
  console.log("=========================================");

  // Backup original keys
  const originalKeys = process.env.GEMINI_API_KEYS;

  // Set up rotation: First key is intentionally invalid, second key is working
  const workingKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  process.env.GEMINI_API_KEYS = `invalid_key_here_123, ${workingKey}`;

  console.log(`Configured GEMINI_API_KEYS with one invalid key followed by the working key.`);
  console.log("Requesting details for 'Antinal' (this should trigger rotation and succeed)...");

  try {
    const details = await getDrugDetailsAI('Antinal');
    console.log("\n[TEST SUCCESS] Key rotation worked!");
    console.log("Antinal scientific name:", details.openfda?.generic_name?.[0]);
  } catch (error) {
    console.error("\n[TEST FAILED] Key rotation did not fallback successfully:", error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
  }

  // Restore original keys
  process.env.GEMINI_API_KEYS = originalKeys;

  console.log("\n=========================================");
  console.log("STARTING TEST: Supabase Cache Graceful Fallback");
  console.log("=========================================");
  console.log("Supabase is currently not configured (empty keys in .env).");
  console.log("Verification: Checking if details are successfully fetched even with Supabase disabled...");

  try {
    const details = await getDrugDetailsAI('Cetafen');
    console.log("\n[TEST SUCCESS] Gracefully bypassed Supabase caching layer.");
    console.log("Cetafen scientific name:", details.openfda?.generic_name?.[0]);
  } catch (error) {
    console.error("\n[TEST FAILED] System crashed when Supabase was not configured:", error.message || error);
  }
}

// Build the backend first to make sure typescript compilation is latest, then run test
const { execSync } = require('child_process');
try {
  console.log("Compiling backend to run tests on latest build...");
  execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
  runTests();
} catch (e) {
  console.error("Backend compilation failed. Cannot run tests.");
}
