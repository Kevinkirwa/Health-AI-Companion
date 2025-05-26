const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  level: { type: String, required: true },
  ownership: { type: String, required: true },
  address: { type: String, required: true },
  county: { type: String, required: true },
  subCounty: { type: String, required: true },
  phone: String,
  email: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  specialties: [String],
  facilities: [String],
  emergencyServices: { type: Boolean, default: true },
  isReferralHospital: { type: Boolean, default: true }
});

// Create 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

const Hospital = mongoose.model('Hospital', hospitalSchema);

// List of all 47 county referral hospitals
const referralHospitals = [
  { name: "Kabarnet County Referral Hospital", county: "Baringo", code: "BAR", level: "Level 5", ownership: "Public", address: "Baringo County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Longisa County Referral Hospital", county: "Bomet", code: "BOM", level: "Level 5", ownership: "Public", address: "Bomet County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Bungoma County Referral Hospital", county: "Bungoma", code: "BUN", level: "Level 5", ownership: "Public", address: "Bungoma County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Busia County Referral Hospital", county: "Busia", code: "BUS", level: "Level 5", ownership: "Public", address: "Busia County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Iten County Referral Hospital", county: "Elgeyo Marakwet", code: "ELG", level: "Level 5", ownership: "Public", address: "Elgeyo Marakwet County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Embu County Referral Hospital", county: "Embu", code: "EMB", level: "Level 5", ownership: "Public", address: "Embu County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Garissa County Referral Hospital", county: "Garissa", code: "GAR", level: "Level 5", ownership: "Public", address: "Garissa County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Homa Bay County Referral Hospital", county: "Homa Bay", code: "HOM", level: "Level 5", ownership: "Public", address: "Homa Bay County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Isiolo County Referral Hospital", county: "Isiolo", code: "ISI", level: "Level 5", ownership: "Public", address: "Isiolo County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kajiado County Referral Hospital", county: "Kajiado", code: "KAJ", level: "Level 5", ownership: "Public", address: "Kajiado County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kakamega County Referral Hospital", county: "Kakamega", code: "KAK", level: "Level 5", ownership: "Public", address: "Kakamega County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kericho County Referral Hospital", county: "Kericho", code: "KER", level: "Level 5", ownership: "Public", address: "Kericho County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kiambu County Referral Hospital", county: "Kiambu", code: "KIA", level: "Level 5", ownership: "Public", address: "Kiambu County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kilifi County Referral Hospital", county: "Kilifi", code: "KIL", level: "Level 5", ownership: "Public", address: "Kilifi County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kerugoya County Referral Hospital", county: "Kirinyaga", code: "KIR", level: "Level 5", ownership: "Public", address: "Kirinyaga County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kisii Teaching and Referral Hospital", county: "Kisii", code: "KIS", level: "Level 5", ownership: "Public", address: "Kisii County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Jaramogi Oginga Odinga Teaching and Referral Hospital", county: "Kisumu", code: "KSM", level: "Level 5", ownership: "Public", address: "Kisumu County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kitui County Referral Hospital", county: "Kitui", code: "KTU", level: "Level 5", ownership: "Public", address: "Kitui County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kwale County Referral Hospital", county: "Kwale", code: "KWA", level: "Level 5", ownership: "Public", address: "Kwale County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Nanyuki Teaching and Referral Hospital", county: "Laikipia", code: "LAI", level: "Level 5", ownership: "Public", address: "Laikipia County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "King Fahad County Hospital", county: "Lamu", code: "LAM", level: "Level 5", ownership: "Public", address: "Lamu County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Machakos Level 5 Hospital", county: "Machakos", code: "MAC", level: "Level 5", ownership: "Public", address: "Machakos County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Makueni County Referral Hospital", county: "Makueni", code: "MAK", level: "Level 5", ownership: "Public", address: "Makueni County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Mandera County Referral Hospital", county: "Mandera", code: "MAN", level: "Level 5", ownership: "Public", address: "Mandera County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Marsabit County Referral Hospital", county: "Marsabit", code: "MAR", level: "Level 5", ownership: "Public", address: "Marsabit County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Meru Teaching and Referral Hospital", county: "Meru", code: "MER", level: "Level 5", ownership: "Public", address: "Meru County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Migori County Referral Hospital", county: "Migori", code: "MIG", level: "Level 5", ownership: "Public", address: "Migori County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Coast General Teaching and Referral Hospital", county: "Mombasa", code: "MOM", level: "Level 5", ownership: "Public", address: "Mombasa County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Murang'a County Referral Hospital", county: "Murang'a", code: "MUR", level: "Level 5", ownership: "Public", address: "Murang'a County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Mama Lucy Kibaki Hospital", county: "Nairobi", code: "NAI", level: "Level 5", ownership: "Public", address: "Nairobi County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Nakuru Level 5 Hospital", county: "Nakuru", code: "NAK", level: "Level 5", ownership: "Public", address: "Nakuru County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kapsabet County Referral Hospital", county: "Nandi", code: "NAN", level: "Level 5", ownership: "Public", address: "Nandi County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Narok County Referral Hospital", county: "Narok", code: "NAR", level: "Level 5", ownership: "Public", address: "Narok County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Nyamira County Referral Hospital", county: "Nyamira", code: "NYA", level: "Level 5", ownership: "Public", address: "Nyamira County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "JM Kariuki Memorial County Referral Hospital", county: "Nyandarua", code: "NYD", level: "Level 5", ownership: "Public", address: "Nyandarua County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Nyeri County Referral Hospital", county: "Nyeri", code: "NYE", level: "Level 5", ownership: "Public", address: "Nyeri County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Samburu County Referral Hospital", county: "Samburu", code: "SAM", level: "Level 5", ownership: "Public", address: "Samburu County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Siaya County Referral Hospital", county: "Siaya", code: "SIA", level: "Level 5", ownership: "Public", address: "Siaya County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Moi County Referral Hospital Voi", county: "Taita Taveta", code: "TAI", level: "Level 5", ownership: "Public", address: "Taita Taveta County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Hola County Referral Hospital", county: "Tana River", code: "TAN", level: "Level 5", ownership: "Public", address: "Tana River County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Chuka County Referral Hospital", county: "Tharaka Nithi", code: "THA", level: "Level 5", ownership: "Public", address: "Tharaka Nithi County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kitale County Referral Hospital", county: "Trans Nzoia", code: "TRA", level: "Level 5", ownership: "Public", address: "Trans Nzoia County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Lodwar County Referral Hospital", county: "Turkana", code: "TUR", level: "Level 5", ownership: "Public", address: "Turkana County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Moi Teaching and Referral Hospital", county: "Uasin Gishu", code: "UAS", level: "Level 6", ownership: "Public", address: "Uasin Gishu County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Vihiga County Referral Hospital", county: "Vihiga", code: "VIH", level: "Level 5", ownership: "Public", address: "Vihiga County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Wajir County Referral Hospital", county: "Wajir", code: "WAJ", level: "Level 5", ownership: "Public", address: "Wajir County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true },
  { name: "Kapenguria County Referral Hospital", county: "West Pokot", code: "WES", level: "Level 5", ownership: "Public", address: "West Pokot County", subCounty: "Main", phone: "", email: "", latitude: 0, longitude: 0, specialties: [], facilities: [], emergencyServices: true, isReferralHospital: true }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing hospitals
    await Hospital.deleteMany({});
    console.log('Cleared existing hospitals');

    // Add location field to each hospital
    const hospitalsWithLocation = referralHospitals.map(hospital => ({
      ...hospital,
      location: {
        type: 'Point',
        coordinates: [hospital.longitude, hospital.latitude]
      }
    }));

    // Insert new hospitals
    await Hospital.insertMany(hospitalsWithLocation);
    console.log('Successfully seeded referral hospitals');

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 