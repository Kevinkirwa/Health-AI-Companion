const express = require('express');

function setupHospitalRoutes(app, storage) {
  const router = express.Router();

  // Get all hospitals
  router.get('/', async (req, res) => {
    try {
      const hospitals = await storage.getAllHospitals();
      res.json({ hospitals });
    } catch (error) {
      console.error('Get hospitals error:', error);
      res.status(500).json({ message: 'Error getting hospitals' });
    }
  });

  // Get saved hospitals (for authenticated users)
  router.get('/saved', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const hospitals = await storage.getSavedHospitals(req.user.id);
      res.json({ hospitals });
    } catch (error) {
      console.error('Get saved hospitals error:', error);
      res.status(500).json({ message: 'Error getting saved hospitals' });
    }
  });

  // Search hospitals
  router.get('/search', async (req, res) => {
    try {
      const { query, latitude, longitude, radius } = req.query;
      const hospitals = await storage.searchHospitals(
        query,
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
      res.json({ hospitals });
    } catch (error) {
      console.error('Search hospitals error:', error);
      res.status(500).json({ message: 'Error searching hospitals' });
    }
  });

  // Get nearby hospitals
  router.get('/nearby', async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.query;
      const hospitals = await storage.getNearbyHospitals(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
      res.json({ hospitals });
    } catch (error) {
      console.error('Get nearby hospitals error:', error);
      res.status(500).json({ message: 'Error getting nearby hospitals' });
    }
  });

  // Get hospitals by specialty
  router.get('/specialty/:specialty', async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.query;
      const hospitals = await storage.getHospitalsBySpecialtyWithLocation(
        req.params.specialty,
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
      res.json({ hospitals });
    } catch (error) {
      console.error('Get hospitals by specialty error:', error);
      res.status(500).json({ message: 'Error getting hospitals by specialty' });
    }
  });

  // Get hospital by ID
  router.get('/:id', async (req, res) => {
    try {
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      res.json({ hospital });
    } catch (error) {
      console.error('Get hospital error:', error);
      res.status(500).json({ message: 'Error getting hospital' });
    }
  });

  // Get doctor schedules by hospital ID - publicly accessible
  router.get('/:id/schedules', async (req, res) => {
    try {
      const hospitalId = req.params.id;
      
      console.log('Received request for hospital schedules, ID:', hospitalId);
      
      // Get all schedules for this hospital
      const schedules = await storage.getSchedulesByHospital(hospitalId);
      
      console.log(`Found ${schedules ? schedules.length : 0} doctor schedules for hospital ${hospitalId}`);
      
      res.json({ schedules });
    } catch (error) {
      console.error('Get hospital schedules error:', error);
      res.status(500).json({ message: 'Error getting hospital schedules' });
    }
  });

  // Save hospital (for authenticated users)
  router.post('/:id/save', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      await storage.saveHospital(req.user.id, req.params.id);
      res.json({ message: 'Hospital saved successfully' });
    } catch (error) {
      console.error('Save hospital error:', error);
      res.status(500).json({ message: 'Error saving hospital' });
    }
  });

  // Remove saved hospital (for authenticated users)
  router.delete('/:id/save', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      await storage.removeSavedHospital(req.user.id, req.params.id);
      res.json({ message: 'Hospital removed from saved list' });
    } catch (error) {
      console.error('Remove saved hospital error:', error);
      res.status(500).json({ message: 'Error removing saved hospital' });
    }
  });

  app.use('/api/hospitals', router);
}

module.exports = { setupHospitalRoutes }; 