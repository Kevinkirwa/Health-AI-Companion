const kenyanHospitals = [
  {
    name: "Kenyatta National Hospital",
    address: "Hospital Road, Nairobi",
    county: "Nairobi",
    subCounty: "Nairobi Central",
    type: "National",
    level: "Level 6",
    facilities: [
      "Emergency Services",
      "ICU",
      "Surgery",
      "Maternity",
      "Pediatrics",
      "Oncology",
      "Cardiology",
      "Neurology"
    ],
    emergencyServices: true,
    insuranceAccepted: [
      "NHIF",
      "AAR",
      "CIC",
      "Jubilee",
      "Madison",
      "UAP",
      "APA"
    ],
    coordinates: {
      latitude: -1.3047,
      longitude: 36.8127
    },
    contact: {
      phone: "+254 20 2726300",
      email: "info@knh.or.ke",
      website: "https://www.knh.or.ke"
    },
    isVerified: true
  },
  {
    name: "Moi Teaching and Referral Hospital",
    address: "Nandi Road, Eldoret",
    county: "Uasin Gishu",
    subCounty: "Eldoret East",
    type: "National",
    level: "Level 6",
    facilities: [
      "Emergency Services",
      "ICU",
      "Surgery",
      "Maternity",
      "Pediatrics",
      "Oncology",
      "Cardiology"
    ],
    emergencyServices: true,
    insuranceAccepted: [
      "NHIF",
      "AAR",
      "CIC",
      "Jubilee",
      "Madison"
    ],
    coordinates: {
      latitude: 0.5204,
      longitude: 35.2697
    },
    contact: {
      phone: "+254 53 2033471",
      email: "info@mtrh.or.ke",
      website: "https://www.mtrh.or.ke"
    },
    isVerified: true
  },
  {
    name: "Coast General Hospital",
    address: "Kisauni Road, Mombasa",
    county: "Mombasa",
    subCounty: "Mvita",
    type: "County",
    level: "Level 5",
    facilities: [
      "Emergency Services",
      "ICU",
      "Surgery",
      "Maternity",
      "Pediatrics"
    ],
    emergencyServices: true,
    insuranceAccepted: [
      "NHIF",
      "AAR",
      "CIC"
    ],
    coordinates: {
      latitude: -4.0435,
      longitude: 39.6682
    },
    contact: {
      phone: "+254 41 2313571",
      email: "info@coastgeneral.go.ke"
    },
    isVerified: true
  },
  {
    name: "Aga Khan University Hospital",
    address: "3rd Parklands Avenue, Nairobi",
    county: "Nairobi",
    subCounty: "Westlands",
    type: "Private",
    level: "Level 5",
    facilities: [
      "Emergency Services",
      "ICU",
      "Surgery",
      "Maternity",
      "Pediatrics",
      "Oncology",
      "Cardiology",
      "Neurology"
    ],
    emergencyServices: true,
    insuranceAccepted: [
      "NHIF",
      "AAR",
      "CIC",
      "Jubilee",
      "Madison",
      "UAP",
      "APA",
      "Alliance"
    ],
    coordinates: {
      latitude: -1.2547,
      longitude: 36.7977
    },
    contact: {
      phone: "+254 20 3662000",
      email: "info@aku.edu",
      website: "https://www.aku.edu"
    },
    isVerified: true
  },
  {
    name: "Nakuru Level 5 Hospital",
    address: "Kenyatta Avenue, Nakuru",
    county: "Nakuru",
    subCounty: "Nakuru East",
    type: "County",
    level: "Level 5",
    facilities: [
      "Emergency Services",
      "ICU",
      "Surgery",
      "Maternity",
      "Pediatrics"
    ],
    emergencyServices: true,
    insuranceAccepted: [
      "NHIF",
      "AAR",
      "CIC"
    ],
    coordinates: {
      latitude: -0.3031,
      longitude: 36.0800
    },
    contact: {
      phone: "+254 51 2214601",
      email: "info@nakurulevel5.go.ke"
    },
    isVerified: true
  }
];

module.exports = { kenyanHospitals }; 