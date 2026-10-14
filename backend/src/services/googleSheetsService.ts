import fs from 'fs';
import path from 'path';
import axios from 'axios';

export interface ClinicalRecord {
  timestamp: string;
  actionType?: string; // e.g. "بحث دواء / Drug Search", "فحص تداخلات / Interaction Check"
  tradeName: string;
  tradeNameAr?: string;
  activeIngredientEn?: string;
  activeIngredientAr?: string;
  activeIngredient?: string;
  dosageForm?: string;
  purposeEn?: string;
  purposeAr?: string;
  purpose?: string;
  dosageEn?: string;
  dosageAr?: string;
  dosage?: string;
  warningsEn?: string;
  warningsAr?: string;
  warnings?: string;
  contraindicationsEn?: string;
  contraindicationsAr?: string;
  contraindications?: string;
  adverseReactionsEn?: string;
  adverseReactionsAr?: string;
  adverseReactions?: string;
  pregnancyEn?: string;
  pregnancyAr?: string;
  pregnancy?: string;
  pediatricEn?: string;
  pediatricAr?: string;
  pediatric?: string;
  geriatricEn?: string;
  geriatricAr?: string;
  geriatric?: string;
  details?: string;
  fdaStatus?: string;
  source: string;
}

// Backward-compatible alias
export type SearchRecord = ClinicalRecord;

const dataDir = path.join(__dirname, '../data');
const csvFile = path.join(dataDir, 'search_records.csv');
const jsonFile = path.join(dataDir, 'search_records.json');

// Ensure directory and CSV header exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const csvHeader = [
  'Timestamp',
  'Action Type',
  'Trade Name EN',
  'Trade Name AR',
  'Active Ingredient EN',
  'Active Ingredient AR',
  'Dosage Form',
  'Indications EN',
  'Indications AR',
  'Dosage EN',
  'Dosage AR',
  'Warnings EN',
  'Warnings AR',
  'Contraindications EN',
  'Contraindications AR',
  'Side Effects EN',
  'Side Effects AR',
  'Pregnancy EN',
  'Pregnancy AR',
  'Pediatric EN',
  'Pediatric AR',
  'Details & Summary',
  'FDA Status & Source'
].join(',') + '\n';

if (!fs.existsSync(csvFile)) {
  fs.writeFileSync(csvFile, csvHeader, 'utf-8');
}

const escapeCsv = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

export const logToGoogleSheets = async (record: ClinicalRecord): Promise<void> => {
  // Normalize fields for backward compatibility
  const normRecord: ClinicalRecord = {
    ...record,
    actionType: record.actionType || 'بحث دواء / Drug Search',
    activeIngredientEn: record.activeIngredientEn || record.activeIngredient || '',
    activeIngredientAr: record.activeIngredientAr || '',
    purposeEn: record.purposeEn || '',
    purposeAr: record.purposeAr || record.purpose || '',
    dosageEn: record.dosageEn || '',
    dosageAr: record.dosageAr || record.dosage || '',
    warningsEn: record.warningsEn || '',
    warningsAr: record.warningsAr || record.warnings || '',
    contraindicationsEn: record.contraindicationsEn || '',
    contraindicationsAr: record.contraindicationsAr || record.contraindications || '',
    adverseReactionsEn: record.adverseReactionsEn || '',
    adverseReactionsAr: record.adverseReactionsAr || record.adverseReactions || '',
    pregnancyEn: record.pregnancyEn || '',
    pregnancyAr: record.pregnancyAr || record.pregnancy || '',
    pediatricEn: record.pediatricEn || '',
    pediatricAr: record.pediatricAr || record.pediatric || '',
    geriatricEn: record.geriatricEn || '',
    geriatricAr: record.geriatricAr || record.geriatric || '',
    details: record.details || '',
    fdaStatus: record.fdaStatus || 'موثق سريرياً / FDA Verified',
    source: record.source || 'YoPharma Engine'
  };

  // 1. Asynchronously log to local CSV file with full bilingual details
  try {
    const csvLine = [
      escapeCsv(normRecord.timestamp),
      escapeCsv(normRecord.actionType),
      escapeCsv(normRecord.tradeName),
      escapeCsv(normRecord.tradeNameAr),
      escapeCsv(normRecord.activeIngredientEn),
      escapeCsv(normRecord.activeIngredientAr),
      escapeCsv(normRecord.dosageForm),
      escapeCsv(normRecord.purposeEn),
      escapeCsv(normRecord.purposeAr),
      escapeCsv(normRecord.dosageEn),
      escapeCsv(normRecord.dosageAr),
      escapeCsv(normRecord.warningsEn),
      escapeCsv(normRecord.warningsAr),
      escapeCsv(normRecord.contraindicationsEn),
      escapeCsv(normRecord.contraindicationsAr),
      escapeCsv(normRecord.adverseReactionsEn),
      escapeCsv(normRecord.adverseReactionsAr),
      escapeCsv(normRecord.pregnancyEn),
      escapeCsv(normRecord.pregnancyAr),
      escapeCsv(normRecord.pediatricEn),
      escapeCsv(normRecord.pediatricAr),
      escapeCsv(normRecord.details),
      escapeCsv(`${normRecord.fdaStatus} (${normRecord.source})`)
    ].join(',') + '\n';

    fs.appendFileSync(csvFile, csvLine, 'utf-8');

    // Maintain JSON records
    let currentRecords: ClinicalRecord[] = [];
    if (fs.existsSync(jsonFile)) {
      try {
        currentRecords = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
      } catch (e) {
        currentRecords = [];
      }
    }
    currentRecords.unshift(normRecord);
    if (currentRecords.length > 500) currentRecords = currentRecords.slice(0, 500);
    fs.writeFileSync(jsonFile, JSON.stringify(currentRecords, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Google Sheets Local Logger] Error saving record:', err);
  }

  // 2. If a Google Sheet Webhook URL is set in environment or default, send complete record asynchronously
  const DEFAULT_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbw5kPJxFQd44drIUVUzLZ528sjxI1YuqMaoaNfQTiLG_OM8iEEHMlydEjdzap3QX081fw/exec';
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_SHEETS_WEBHOOK;
  if (webhookUrl) {
    axios.post(webhookUrl, normRecord, { timeout: 6000 })
      .then(() => console.log(`[Google Sheets Webhook 🚀] Successfully synced bilingual record for "${normRecord.tradeName}" to Google Sheet`))
      .catch((err) => console.warn(`[Google Sheets Webhook Warning] Could not sync to remote Google Sheet:`, err.message));
  }
};

export const getSearchRecords = (): ClinicalRecord[] => {
  if (fs.existsSync(jsonFile)) {
    try {
      return JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    } catch (e) {
      return [];
    }
  }
  return [];
};
