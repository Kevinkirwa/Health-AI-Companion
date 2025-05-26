import { CountyReferralHospital } from '../data/countyReferralHospitals';
import { countyReferralHospitals } from '../data/countyReferralHospitals';

interface Location {
  county: string;
  latitude?: number;
  longitude?: number;
}

interface EmergencyType {
  type: 'cardiac' | 'trauma' | 'pediatric' | 'obstetric' | 'general';
  severity: 'critical' | 'urgent' | 'stable';
}

export function findNearestHospitals(
  userLocation: Location,
  emergencyType?: EmergencyType,
  maxResults: number = 5
): CountyReferralHospital[] {
  // First, get hospitals in the user's county
  const countyHospitals = countyReferralHospitals.filter(
    hospital => hospital.county.toLowerCase() === userLocation.county.toLowerCase()
  );

  // If there are hospitals in the user's county, prioritize them
  if (countyHospitals.length > 0) {
    // Sort by emergency services if emergency type is provided
    if (emergencyType) {
      countyHospitals.sort((a, b) => {
        const aHasService = a.services.some(service => 
          service.toLowerCase().includes(emergencyType.type.toLowerCase())
        );
        const bHasService = b.services.some(service => 
          service.toLowerCase().includes(emergencyType.type.toLowerCase())
        );
        return bHasService ? 1 : -1;
      });
    }

    // Return top hospitals from user's county
    return countyHospitals.slice(0, maxResults);
  }

  // If no hospitals in user's county, get nearest hospitals from other counties
  const otherCountyHospitals = countyReferralHospitals.filter(
    hospital => hospital.county.toLowerCase() !== userLocation.county.toLowerCase()
  );

  // Sort by emergency services if emergency type is provided
  if (emergencyType) {
    otherCountyHospitals.sort((a, b) => {
      const aHasService = a.services.some(service => 
        service.toLowerCase().includes(emergencyType.type.toLowerCase())
      );
      const bHasService = b.services.some(service => 
        service.toLowerCase().includes(emergencyType.type.toLowerCase())
      );
      return bHasService ? 1 : -1;
    });
  }

  // Return top hospitals from other counties
  return otherCountyHospitals.slice(0, maxResults);
}

// Helper function to get emergency-specific hospitals
export function getEmergencySpecificHospitals(
  emergencyType: EmergencyType,
  maxResults: number = 5
): CountyReferralHospital[] {
  return countyReferralHospitals
    .filter(hospital => 
      hospital.services.some(service => 
        service.toLowerCase().includes(emergencyType.type.toLowerCase())
      )
    )
    .slice(0, maxResults);
}

// Example usage:
// const nearestHospitals = findNearestHospitals(
//   { county: 'Nakuru' },
//   { type: 'cardiac', severity: 'critical' }
// ); 