# TalentX — AI-Powered Talent Acquisition Platform

TalentX is a comprehensive AI-driven talent acquisition platform designed to streamline the hiring process for organizations. It leverages advanced AI models (primarily Gemini with OpenAI fallback) to analyze resumes, assess culture fit, perform diversity analytics, and facilitate talent discovery.

## Features

### 🔍 Resume Screening
- Upload and analyze PDF resumes
- AI-powered extraction of skills, experience, and education
- Automated fit score calculation (0-100) based on job descriptions
- Detailed candidate profiles with reasoning

### 👥 Referral Portal
- Employee referral management system
- Track referral submissions and status
- Incentivize internal talent sourcing

### 📊 Diversity Analytics
- Real-time diversity metrics dashboard
- Gender and education distribution analysis
- Diversity index calculation
- Visual charts and graphs for insights

### 🎯 Talent Discovery
- Semantic search through candidate database
- AI-powered matching based on skills and experience
- Keyword and vector-based ranking
- Top 10 candidate recommendations

### 🏢 Culture Fit Analysis
- Assess candidate alignment with company culture
- AI-generated fit scores and explanations
- Custom culture statement integration

### 📈 Dashboard
- Overview of key metrics (total candidates, referrals, average fit score)
- Quick access to all platform features
- Real-time data visualization

### 🔐 Authentication & Security
- JWT-based user authentication
- Secure API endpoints with rate limiting
- CORS and Helmet security middleware
- Password hashing with bcrypt

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualization
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **PDF.js-extract** for resume parsing
- **Winston** for logging
- **Morgan** for HTTP request logging

### AI Integration
- **Primary:** Google Gemini/Vertex AI
- **Fallback:** OpenAI GPT models
- Custom AI service wrapper with flexible configuration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (optional, can run without DB)
- AI API keys (Gemini or OpenAI)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shahk87654/TalentX.git
cd TalentX
```

2. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

3. Set up environment variables (create `.env` in server directory):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talentx
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
# Optional OpenAI fallback
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
TalentX/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── context/        # State management
│   │   └── utils/          # API and utilities
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database and AI configs
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/    # Auth and security
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   └── services/       # AI and business logic
└── README.md
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/resume/upload` - Resume upload and analysis
- `GET /api/resume/candidates` - Get analyzed candidates
- `POST /api/referrals` - Submit referrals
- `GET /api/diversity/metrics` - Diversity analytics
- `POST /api/talent/search` - Talent discovery
- `POST /api/culturefit/analyze` - Culture fit assessment
- `GET /api/dashboard` - Dashboard summary

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

TalentX was built to revolutionize talent acquisition by combining cutting-edge AI technology with intuitive user interfaces. Our platform helps organizations make data-driven hiring decisions while promoting diversity and cultural alignment in the workplace.

For more information, visit our [GitHub repository](https://github.com/shahk87654/TalentX).
