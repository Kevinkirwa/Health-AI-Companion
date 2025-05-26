export interface Hospital {
  id: string;
  name: string;
  county: string;
  location: string;
  contact: string;
  services: string[];
  emergencyServices: boolean;
  referralLevel: number;
}

export const countyReferralHospitals: Hospital[] = [
  {
    id: "1",
    name: "Kenyatta National Hospital",
    county: "Nairobi",
    location: "Nairobi",
    contact: "+254 20 2726300",
    services: ["Emergency", "Surgery", "ICU", "Maternity", "Pediatrics"],
    emergencyServices: true,
    referralLevel: 1
  },
  {
    id: "2",
    name: "Moi Teaching and Referral Hospital",
    county: "Uasin Gishu",
    location: "Eldoret",
    contact: "+254 53 2033471",
    services: ["Emergency", "Surgery", "ICU", "Maternity", "Pediatrics"],
    emergencyServices: true,
    referralLevel: 1
  },
  {
    id: "3",
    name: "Coast General Hospital",
    county: "Mombasa",
    location: "Mombasa",
    contact: "+254 41 2312191",
    services: ["Emergency", "Surgery", "ICU", "Maternity"],
    emergencyServices: true,
    referralLevel: 2
  }
]; 