import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { MongoStorage } from '../storage/mongodb.js';
import { Hospital } from '../models/Hospital.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function importHospitals() {
  try {
    console.log('Starting hospital import...');
    
    // Read the hospitals.json file
    const hospitalsPath = join(__dirname, 'hospitals.json');
    const hospitalsData = await fs.readFile(hospitalsPath, 'utf-8');
    const hospitals = JSON.parse(hospitalsData);
    
    // Initialize storage
    const storage = new MongoStorage();
    
    // Transform and import each hospital
    let imported = 0;
    let skipped = 0;
    
    for (const hospital of hospitals) {
      try {
        // Transform to match your Hospital model
        const hospitalData: Hospital = {
          name: hospital.name,
          code: hospital.code,
          level: hospital.level,
          ownership: hospital.ownership,
          services: hospital.services,
          contact: {
            phone: hospital.contact.phone,
            email: hospital.contact.email,
            address: hospital.contact.address
          },
          location: {
            county: hospital.location.county,
            subCounty: hospital.location.subCounty,
            ward: hospital.location.ward
          },
          // Add any additional required fields with default values
          isVerified: true,
          source: 'KMHFL',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Check if hospital already exists
        const existing = await storage.searchHospitals(hospital.name);
        if (existing.length > 0) {
          console.log(`Skipping existing hospital: ${hospital.name}`);
          skipped++;
          continue;
        }
        
        // Import hospital
        await storage.addHospital(hospitalData);
        console.log(`Imported hospital: ${hospital.name}`);
        imported++;
        
      } catch (error) {
        console.error(`Error importing hospital ${hospital.name}:`, error);
      }
    }
    
    console.log(`Import completed. Imported: ${imported}, Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

console.log('Starting hospital import process...');
importHospitals()
  .then(() => console.log('Import completed successfully!'))
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 