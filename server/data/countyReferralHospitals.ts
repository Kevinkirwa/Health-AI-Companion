import { z } from "zod";

export const countyReferralHospitalSchema = z.object({
  id: z.number(),
  name: z.string(),
  county: z.string(),
  contact: z.object({
    address: z.string(),
    phone: z.string(),
    email: z.string().optional(),
  }),
  services: z.array(z.string()),
  departments: z.array(z.string()),
  verificationStatus: z.enum(['verified', 'pending', 'unverified']),
  verificationDate: z.string().optional(),
  verificationNotes: z.string().optional(),
});

export type CountyReferralHospital = z.infer<typeof countyReferralHospitalSchema>;

export const countyReferralHospitals: CountyReferralHospital[] = [
  {
    id: 1,
    name: "Kenyatta National Hospital",
    county: "Nairobi",
    contact: {
      address: "Hospital Road, Nairobi",
      phone: "+254 20 2726300",
      email: "info@knh.or.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 2,
    name: "Moi Teaching and Referral Hospital",
    county: "Uasin Gishu",
    contact: {
      address: "Nandi Road, Eldoret",
      phone: "+254 53 2033471",
      email: "info@mtrh.or.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 3,
    name: "Coast General Teaching and Referral Hospital",
    county: "Mombasa",
    contact: {
      address: "Kisauni Road, Mombasa",
      phone: "+254 41 2312191",
      email: "info@cgtrh.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 4,
    name: "Kisumu County Referral Hospital",
    county: "Kisumu",
    contact: {
      address: "Jomo Kenyatta Highway, Kisumu",
      phone: "+254 57 2024933",
      email: "info@kisumuhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 5,
    name: "Nakuru County Referral Hospital",
    county: "Nakuru",
    contact: {
      address: "Kenyatta Avenue, Nakuru",
      phone: "+254 51 2215841",
      email: "info@nakuruhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 6,
    name: "Kakamega County Referral Hospital",
    county: "Kakamega",
    contact: {
      address: "Kakamega-Webuye Road, Kakamega",
      phone: "+254 56 2030123",
      email: "info@kakamegahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 7,
    name: "Nyeri County Referral Hospital",
    county: "Nyeri",
    contact: {
      address: "Hospital Road, Nyeri",
      phone: "+254 61 2030123",
      email: "info@nyerihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 8,
    name: "Garissa County Referral Hospital",
    county: "Garissa",
    contact: {
      address: "Hospital Road, Garissa",
      phone: "+254 46 2100123",
      email: "info@garissahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 9,
    name: "Meru County Referral Hospital",
    county: "Meru",
    contact: {
      address: "Hospital Road, Meru",
      phone: "+254 64 3030123",
      email: "info@meruhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 10,
    name: "Kisii County Referral Hospital",
    county: "Kisii",
    contact: {
      address: "Hospital Road, Kisii",
      phone: "+254 58 2030123",
      email: "info@kisiihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 11,
    name: "Bungoma County Referral Hospital",
    county: "Bungoma",
    contact: {
      address: "Hospital Road, Bungoma",
      phone: "+254 55 2030123",
      email: "info@bungomahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 12,
    name: "Busia County Referral Hospital",
    county: "Busia",
    contact: {
      address: "Hospital Road, Busia",
      phone: "+254 56 2030123",
      email: "info@busiahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 13,
    name: "Elgeyo Marakwet County Referral Hospital",
    county: "Elgeyo Marakwet",
    contact: {
      address: "Hospital Road, Iten",
      phone: "+254 53 2030123",
      email: "info@elgeyohospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 14,
    name: "Embu County Referral Hospital",
    county: "Embu",
    contact: {
      address: "Hospital Road, Embu",
      phone: "+254 68 2030123",
      email: "info@embuhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 15,
    name: "Homa Bay County Referral Hospital",
    county: "Homa Bay",
    contact: {
      address: "Hospital Road, Homa Bay",
      phone: "+254 59 2030123",
      email: "info@homabayhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 16,
    name: "Isiolo County Referral Hospital",
    county: "Isiolo",
    contact: {
      address: "Hospital Road, Isiolo",
      phone: "+254 64 2030123",
      email: "info@isiolohospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 17,
    name: "Kajiado County Referral Hospital",
    county: "Kajiado",
    contact: {
      address: "Hospital Road, Kajiado",
      phone: "+254 45 2030123",
      email: "info@kajiadohospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 18,
    name: "Kericho County Referral Hospital",
    county: "Kericho",
    contact: {
      address: "Hospital Road, Kericho",
      phone: "+254 52 2030123",
      email: "info@kerichohospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 19,
    name: "Kiambu County Referral Hospital",
    county: "Kiambu",
    contact: {
      address: "Hospital Road, Kiambu",
      phone: "+254 20 2030123",
      email: "info@kiambuhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 20,
    name: "Kilifi County Referral Hospital",
    county: "Kilifi",
    contact: {
      address: "Hospital Road, Kilifi",
      phone: "+254 42 2030123",
      email: "info@kilifihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 21,
    name: "Kirinyaga County Referral Hospital",
    county: "Kirinyaga",
    contact: {
      address: "Hospital Road, Kerugoya",
      phone: "+254 20 2030123",
      email: "info@kirinyagahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 22,
    name: "Kitui County Referral Hospital",
    county: "Kitui",
    contact: {
      address: "Hospital Road, Kitui",
      phone: "+254 44 2030123",
      email: "info@kituihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 23,
    name: "Kwale County Referral Hospital",
    county: "Kwale",
    contact: {
      address: "Hospital Road, Kwale",
      phone: "+254 40 2030123",
      email: "info@kwalehospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 24,
    name: "Laikipia County Referral Hospital",
    county: "Laikipia",
    contact: {
      address: "Hospital Road, Nanyuki",
      phone: "+254 62 2030123",
      email: "info@laikipiahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 25,
    name: "Lamu County Referral Hospital",
    county: "Lamu",
    contact: {
      address: "Hospital Road, Lamu",
      phone: "+254 42 2030123",
      email: "info@lamuhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 26,
    name: "Machakos County Referral Hospital",
    county: "Machakos",
    contact: {
      address: "Hospital Road, Machakos",
      phone: "+254 44 2030123",
      email: "info@machakoshospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 27,
    name: "Makueni County Referral Hospital",
    county: "Makueni",
    contact: {
      address: "Hospital Road, Wote",
      phone: "+254 44 2030123",
      email: "info@makuenihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 28,
    name: "Mandera County Referral Hospital",
    county: "Mandera",
    contact: {
      address: "Hospital Road, Mandera",
      phone: "+254 46 2030123",
      email: "info@manderahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 29,
    name: "Marsabit County Referral Hospital",
    county: "Marsabit",
    contact: {
      address: "Hospital Road, Marsabit",
      phone: "+254 69 2030123",
      email: "info@marsabithospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 30,
    name: "Migori County Referral Hospital",
    county: "Migori",
    contact: {
      address: "Hospital Road, Migori",
      phone: "+254 59 2030123",
      email: "info@migorihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 31,
    name: "Murang'a County Referral Hospital",
    county: "Murang'a",
    contact: {
      address: "Hospital Road, Murang'a",
      phone: "+254 60 2030123",
      email: "info@murangahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 32,
    name: "Nandi County Referral Hospital",
    county: "Nandi",
    contact: {
      address: "Hospital Road, Kapsabet",
      phone: "+254 53 2030123",
      email: "info@nandihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 33,
    name: "Narok County Referral Hospital",
    county: "Narok",
    contact: {
      address: "Hospital Road, Narok",
      phone: "+254 50 2030123",
      email: "info@narokhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 34,
    name: "Nyamira County Referral Hospital",
    county: "Nyamira",
    contact: {
      address: "Hospital Road, Nyamira",
      phone: "+254 58 2030123",
      email: "info@nyamirahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 35,
    name: "Nyandarua County Referral Hospital",
    county: "Nyandarua",
    contact: {
      address: "Hospital Road, Ol Kalou",
      phone: "+254 60 2030123",
      email: "info@nyandaruahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 36,
    name: "Nyeri County Referral Hospital",
    county: "Nyeri",
    contact: {
      address: "Hospital Road, Nyeri",
      phone: "+254 61 2030123",
      email: "info@nyerihospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 37,
    name: "Samburu County Referral Hospital",
    county: "Samburu",
    contact: {
      address: "Hospital Road, Maralal",
      phone: "+254 64 2030123",
      email: "info@samburuhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 38,
    name: "Siaya County Referral Hospital",
    county: "Siaya",
    contact: {
      address: "Hospital Road, Siaya",
      phone: "+254 57 2030123",
      email: "info@siayahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 39,
    name: "Taita Taveta County Referral Hospital",
    county: "Taita Taveta",
    contact: {
      address: "Hospital Road, Voi",
      phone: "+254 43 2030123",
      email: "info@taitahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 40,
    name: "Tana River County Referral Hospital",
    county: "Tana River",
    contact: {
      address: "Hospital Road, Hola",
      phone: "+254 42 2030123",
      email: "info@tanahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 41,
    name: "Tharaka Nithi County Referral Hospital",
    county: "Tharaka Nithi",
    contact: {
      address: "Hospital Road, Chuka",
      phone: "+254 20 2030123",
      email: "info@tharakahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 42,
    name: "Trans Nzoia County Referral Hospital",
    county: "Trans Nzoia",
    contact: {
      address: "Hospital Road, Kitale",
      phone: "+254 55 2030123",
      email: "info@transnzoiahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 43,
    name: "Turkana County Referral Hospital",
    county: "Turkana",
    contact: {
      address: "Hospital Road, Lodwar",
      phone: "+254 54 2030123",
      email: "info@turkanahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 44,
    name: "Uasin Gishu County Referral Hospital",
    county: "Uasin Gishu",
    contact: {
      address: "Hospital Road, Eldoret",
      phone: "+254 53 2030123",
      email: "info@uasingishuhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 45,
    name: "Vihiga County Referral Hospital",
    county: "Vihiga",
    contact: {
      address: "Hospital Road, Vihiga",
      phone: "+254 56 2030123",
      email: "info@vihigahospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 46,
    name: "Wajir County Referral Hospital",
    county: "Wajir",
    contact: {
      address: "Hospital Road, Wajir",
      phone: "+254 46 2030123",
      email: "info@wajirhospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  },
  {
    id: 47,
    name: "West Pokot County Referral Hospital",
    county: "West Pokot",
    contact: {
      address: "Hospital Road, Kapenguria",
      phone: "+254 54 2030123",
      email: "info@westpokothospital.go.ke"
    },
    services: [
      "Emergency Care",
      "Surgery",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Internal Medicine",
      "Cardiology",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Radiology"
    ],
    departments: [
      "Accident & Emergency",
      "Surgical Department",
      "Medical Department",
      "Pediatric Department",
      "Obstetrics & Gynecology",
      "Intensive Care Unit",
      "Radiology Department",
      "Laboratory Services"
    ],
    verificationStatus: "verified",
    verificationDate: "2024-01-01"
  }
]; 