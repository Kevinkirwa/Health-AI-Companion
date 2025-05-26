import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// KMHFL API credentials
const API_USERNAME = process.env.KMHFL_USERNAME;
const API_PASSWORD = process.env.KMHFL_PASSWORD;

if (!API_USERNAME || !API_PASSWORD) {
  console.error('Please set KMHFL_USERNAME and KMHFL_PASSWORD environment variables');
  process.exit(1);
}

interface Hospital {
  name: string;
  code: string;
  level: string;
  ownership: string;
  services: string[];
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  location: {
    county: string;
    subCounty: string;
    ward?: string;
  };
}

interface ApiResponse {
  results: any[];
  next: string | null;
  previous: string | null;
  count: number;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAuthToken(): Promise<string> {
  try {
    const response = await axios.post('https://api.kmhfl.health.go.ke/api/token/', {
      username: API_USERNAME,
      password: API_PASSWORD
    });
    
    return response.data.access;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Authentication Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw new Error('Failed to authenticate with KMHFL API');
  }
}

async function getHospitalTypeId(token: string): Promise<string> {
  console.log('Fetching facility types...');
  try {
    const response = await axios.get('https://api.kmhfl.health.go.ke/api/facilities/facility_types/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Unexpected API response:', response.data);
      throw new Error('Invalid API response format');
    }
    
    const hospitalType = response.data.find(
      (type: any) => type.name && type.name.toLowerCase().includes('hospital')
    );
    
    if (!hospitalType) {
      throw new Error('Could not find hospital facility type');
    }
    
    console.log(`Found hospital type: ${hospitalType.name} (ID: ${hospitalType.id})`);
    return hospitalType.id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
}

async function fetchHospitals(token: string, hospitalTypeId: string): Promise<Hospital[]> {
  const hospitals: Hospital[] = [];
  let nextUrl: string | null = `https://api.kmhfl.health.go.ke/api/facilities/facilities/?facility_type=${hospitalTypeId}&is_published=true&is_classified=false&page_size=1000`;
  
  while (nextUrl) {
    try {
      console.log(`Fetching hospitals from: ${nextUrl}`);
      const response = await axios.get<ApiResponse>(nextUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.data || !Array.isArray(response.data.results)) {
        console.error('Unexpected API response:', response.data);
        throw new Error('Invalid API response format');
      }
      
      const pageHospitals = response.data.results.map((facility: any) => ({
        name: facility.name || '',
        code: facility.code || '',
        level: facility.level_name || '',
        ownership: facility.owner_name || '',
        services: facility.services?.map((s: any) => s.name) || [],
        contact: {
          phone: facility.phone_number,
          email: facility.email,
          address: facility.address
        },
        location: {
          county: facility.county_name || '',
          subCounty: facility.sub_county_name || '',
          ward: facility.ward_name
        }
      }));
      
      hospitals.push(...pageHospitals);
      console.log(`Fetched ${pageHospitals.length} hospitals. Total: ${hospitals.length}`);
      
      nextUrl = response.data.next;
      if (nextUrl) {
        await sleep(1000); // Rate limiting
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  }
  
  return hospitals;
}

async function scrapeHospitals() {
  try {
    console.log('Starting hospital data fetch...');
    
    // Get authentication token
    const token = await getAuthToken();
    console.log('Successfully authenticated with KMHFL API');
    
    // Get hospital type ID
    const hospitalTypeId = await getHospitalTypeId(token);
    
    // Fetch all hospitals
    const hospitals = await fetchHospitals(token, hospitalTypeId);
    
    // Save results
    const outputPath = join(__dirname, 'hospitals.json');
    await fs.writeFile(outputPath, JSON.stringify(hospitals, null, 2));
    console.log(`Fetched ${hospitals.length} hospitals. Data saved to ${outputPath}`);
    
  } catch (error) {
    console.error('Error during data fetch:', error);
    throw error;
  }
}

console.log('Starting hospital data fetch process...');
scrapeHospitals()
  .then(() => console.log('Data fetch completed successfully!'))
  .catch(error => {
    console.error('Data fetch failed:', error);
    process.exit(1);
  }); 