# Health AI Companion 🏥

![Health AI Companion](https://img.shields.io/badge/Status-Development-green)
![License](https://img.shields.io/badge/License-MIT-blue)

A comprehensive healthcare platform that provides AI-powered health guidance, hospital finder, mental health support, and appointment booking services. Our mission is to make healthcare more accessible, efficient, and personalized through technology.

## Features

- 🤖 AI Health Chatbot for instant medical guidance
- 🏥 Hospital Finder with real-time availability
- 🧠 Mental Health Support and Resources
- 📅 Doctor Appointment Booking System
- 📱 Multi-platform Notifications (SMS, Email, WhatsApp)
- 🌍 Multi-language Support
- 🚑 Emergency Services Integration

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI Integration**: Google Gemini
- **Authentication**: JWT
- **Notifications**: Twilio, WhatsApp Business API
- **Maps**: Google Maps API

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn
- Git

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Kevinkirwa/Health-AI-Companion.git
   cd Health-AI-Companion
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   ```bash
   # In the root directory
   cp .env.example .env
   # In the server directory
   cd server
   cp .env.example .env
   ```
   Edit the `.env` files with your configuration values.

4. Start the development servers:
   ```bash
   # Start the backend server (from the server directory)
   npm run dev

   # Start the frontend development server (from the client directory)
   npm run dev
   ```

## Project Structure

```
Health-AI-Companion/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions and API clients
│   └── public/           # Static assets
├── server/                # Backend Node.js application
│   ├── api/              # API routes
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
└── scripts/              # Utility scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Testing

We use a comprehensive testing strategy to ensure reliability and performance:

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

### Manual Testing Checklist

- ✅ User Authentication (Login/Registration)
- ✅ Chatbot Responses
- ✅ Hospital Search Functionality
- ✅ Appointment Booking Flow
- ✅ Email Notifications
- ✅ Mobile Responsiveness

## Security Features

The Health AI Companion implements several security best practices:

- 🔒 JWT-based Authentication
- 🔒 Password Hashing with bcrypt
- 🔒 Input Validation and Sanitization
- 🔒 HTTPS/SSL Support
- 🔒 Rate Limiting for API Endpoints
- 🔒 Secure Headers Implementation
- 🔒 Environment-based Configuration

## Performance Optimizations

- ⚡ React Component Memoization
- ⚡ API Response Caching
- ⚡ Lazy Loading of Components
- ⚡ Optimized Images and Assets
- ⚡ Code Splitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Kirwa - [@Kevinkirwa](https://github.com/Kevinkirwa)

Project Link: [https://github.com/Kevinkirwa/Health-AI-Companion](https://github.com/Kevinkirwa/Health-AI-Companion) 