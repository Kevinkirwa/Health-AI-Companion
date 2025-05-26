# Health AI Companion - Emergency Hospital Finder

A web application that helps users find the nearest emergency hospitals based on their location and emergency type.

## Features

- Find nearest emergency hospitals by county
- Filter hospitals by emergency type (cardiac, trauma, pediatric, obstetric, general)
- Get directions to selected hospitals
- View hospital services and contact information
- Real-time location-based hospital recommendations

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (for the database)

{
  "email": "admin@example.com",
  "username": "admin",
  "password": "Access123",
  "name": "Admin User"
}

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd health-ai-companion
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/health-ai-companion
```

4. Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:3000
```

## Running the Application

1. Start the development servers:
```bash
# From the root directory
npm run dev
```

This will start both the server and client in development mode.

- Server will run on: http://localhost:3000
- Client will run on: http://localhost:5173

## Building for Production

1. Build both client and server:
```bash
npm run build
```

2. Start the production servers:
```bash
npm start
```

## Project Structure

```
health-ai-companion/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── server/                # Backend Express application
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── models/      # Database models
│   │   └── utils/       # Utility functions
│   └── data/            # Static data
└── package.json          # Root package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 