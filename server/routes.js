const express = require('express');
const { setupAuthRoutes } = require('./api/auth');
const { setupDoctorDashboardRoutes } = require('./api/doctor-dashboard');
const { setupAdminDashboardRoutes } = require('./api/admin-dashboard');
const { setupChatRoutes } = require('./api/chat');
const { setupHospitalRoutes } = require('./api/hospitals');
const { setupAppointmentRoutes } = require('./api/appointments');

function setupRoutes(app, storage) {
  // Setup all routes
  setupAuthRoutes(app);
  setupDoctorDashboardRoutes(app, storage);
  setupAdminDashboardRoutes(app);
  setupChatRoutes(app);
  setupHospitalRoutes(app);
  setupAppointmentRoutes(app);

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
}

module.exports = { setupRoutes }; 