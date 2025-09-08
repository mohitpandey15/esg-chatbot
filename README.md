# ESG Data Chatbot

**An AI-Powered Full-Stack Application for Querying Steel Manufacturing ESG Data**

![Architecture Overview](https://github.com/user-attachments/assets/515292f5-738d-4dd4-881c-12a3f5db0e7c)

> **Note**: This application requires an OpenAI API key to function. No API key is included for privacy and cost reasons.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [AI Workflow](#ai-workflow)
- [Technical Design Decisions](#technical-design-decisions)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

The ESG Data Chatbot is a sophisticated full-stack web application that allows users to query Environmental, Social, and Governance (ESG) data from steel manufacturing operations using natural language. The system leverages OpenAI's GPT models to convert natural language questions into SQL queries, execute them against a SQLite database, and present results in an intuitive web interface.

### Key Capabilities
- **Natural Language Processing**: Ask complex questions in plain English
- **Intelligent SQL Generation**: AI converts questions to optimized SQL queries
- **Interactive Data Exploration**: Browse database tables and export data
- **Real-time Chat Interface**: Modern conversational UI with message history
- **Data Visualization**: Tables with sorting, pagination, and filtering
- **Export Functionality**: Download results as CSV or JSON
- **Database Management**: Automated CSV data ingestion and table creation

---

## Features

### Natural Language Querying
- Ask questions like "Show me steel production data for last 6 months"
- AI interprets context and generates appropriate SQL queries
- Handles complex queries with joins, aggregations, and filters
- Provides human-readable explanations of results

### Database Explorer
- Browse all available tables and their schemas
- View sample data with row counts and column information
- Interactive table viewer with sorting and pagination
- Export individual tables or query results

### Chat Interface
- Modern conversational UI with message bubbles
- Message history preservation during session
- Real-time typing indicators and loading states
- Query suggestions for common ESG metrics
- SQL query display with copy functionality

### Data Management
- Automatic CSV data ingestion and table creation
- Dynamic schema inference from CSV files
- Data type detection and optimization
- Connection status monitoring

### Developer Tools
- Comprehensive debug scripts for system validation
- Health check endpoints for monitoring
- Detailed logging for troubleshooting
- Environment-based configuration management

---

## Architecture

The application follows a modern three-tier architecture:

### Frontend Layer (React)
- **User Interface**: Modern React SPA with styled-components
- **State Management**: Custom hooks for chat and API state
- **Routing**: React Router for navigation between chat and explorer
- **API Integration**: Axios-based service layer with interceptors

### Backend Layer (FastAPI)
- **API Gateway**: RESTful endpoints with automatic documentation
- **Business Logic**: AI service for NLP processing and SQL generation
- **Database Layer**: SQLite with pandas for data operations
- **Configuration**: Environment-based settings with validation

### AI Processing Layer
- **Language Model**: OpenAI GPT-4 for natural language understanding
- **Prompt Engineering**: Carefully crafted prompts for SQL generation
- **Context Management**: Database schema injection for accurate queries
- **Response Formatting**: Human-readable result summarization

### Data Flow
1. User enters natural language query in React frontend
2. Frontend sends request to FastAPI backend via REST API
3. Backend processes query through AI service
4. AI service sends context + query to OpenAI API
5. Generated SQL is executed against SQLite database
6. Results are formatted and sent back to frontend
7. Frontend displays results in interactive table format

---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Python** | 3.10+ | Core language | Excellent AI/ML ecosystem, rapid development |
| **FastAPI** | 0.104.1 | Web framework | Modern async framework, automatic docs, type hints |
| **Uvicorn** | 0.24.0 | ASGI server | High-performance async server |
| **SQLite** | 3.x | Database | Lightweight, file-based, perfect for demos |
| **Pandas** | 2.1.4 | Data processing | Excellent CSV handling and schema inference |
| **OpenAI** | 1.3.8 | AI integration | Industry-leading language models |
| **Pydantic** | 2.5.0 | Data validation | Type safety and automatic validation |

### Frontend Technologies

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 18.2.0 | UI library | Component-based, excellent ecosystem |
| **styled-components** | 5.3.5 | Styling | CSS-in-JS, dynamic styling, theming |
| **Axios** | 1.4.0 | HTTP client | Promise-based, interceptors, error handling |
| **React Router** | 6.3.0 | Navigation | Modern routing with hooks |
| **TypeScript** | 4.7.4 | Type safety | Enhanced development experience |

### Development Tools

| Tool | Purpose | Why Chosen |
|------|---------|------------|
| **Python venv** | Environment isolation | Standard Python environment management |
| **npm** | Package management | Standard Node.js package manager |
| **ESLint** | Code linting | Code quality and consistency |
| **Git** | Version control | Industry standard version control |

---

## Database Schema

The database is automatically generated from the ESG CSV data file. The schema includes:

### Core Tables
- **production**: Steel production metrics by month
- **emission**: CO2 and other emission data
- **water_consumption**: Water usage metrics
- **power_consumption**: Energy consumption data
- **waste_management**: Waste generation and recycling data
- **equipment_efficiency**: Equipment performance metrics
- **fuel_consumption**: Fuel usage by type

### Schema Features
- **Dynamic Creation**: Tables created automatically from CSV structure
- **Type Inference**: Column types inferred from data content
- **Flexible Structure**: Supports varying CSV formats
- **Relationship Support**: Can handle related data across tables

### Sample Schema (Production Table)
```sql
CREATE TABLE production (
    Parameter TEXT,
    April REAL,
    May REAL,
    June REAL,
    July REAL,
    August REAL,
    September REAL,
    October REAL,
    November REAL,
    December REAL,
    January REAL,
    February REAL,
    March REAL,
    YOD REAL
);
```

---

## Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 16 or higher
- npm or yarn
- OpenAI API key

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/esg-chatbot.git
cd esg-chatbot
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv esg-chatbot-env

# Activate virtual environment
# Windows:
esg-chatbot-env\Scripts\activate
# macOS/Linux:
source esg-chatbot-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
.env
# Edit .env file and add your OpenAI API key:
# OPENAI_API_KEY=your_api_key_here

# Place your ESG data file
# Copy Steel_Manufacturing_ESG_data.csv to project root

# Run automated setup
python setup.py

# Start backend server
python main.py
```

### 3. Frontend Setup
```bash
# Open new terminal in project directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Verification
- Backend API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Frontend application: http://localhost:3000
- Health check: http://localhost:8000/health

### 5. Testing
```bash
# Run comprehensive system test
python debug_chatbot.py
```

---

## AI Workflow

### Natural Language Processing Pipeline

1. **Query Reception**
   - User submits natural language query via React frontend
   - Frontend validates input and sends to backend API

2. **Context Preparation**
   - Backend retrieves database schema information
   - Schema is formatted for AI context with table names and column types
   - System prompt is constructed with ESG domain knowledge

3. **AI Processing**
   - Query + schema context sent to OpenAI GPT-4
   - AI generates SQL query based on natural language intent
   - Response is parsed and validated for safety (SELECT only)

4. **SQL Execution**
   - Generated SQL is executed against SQLite database
   - Results are retrieved and formatted
   - Error handling for invalid queries or empty results

5. **Response Generation**
   - Raw data is processed into human-readable format
   - Summary statistics are calculated
   - Results are formatted for frontend display

### Prompt Engineering Strategy

```python
system_prompt = """You are an expert SQL query generator for ESG data.

Database Schema:
{schema_context}

Rules:
1. Only generate SELECT statements
2. Use proper SQLite syntax
3. Add sensible LIMIT clauses (default 100)
4. Handle case-insensitive column matching
5. Return only SQL query, no explanations

Examples:
- "steel production data" → "SELECT * FROM production LIMIT 100"
- "total CO2 emissions" → "SELECT SUM(total_co2) FROM emission"
"""
```

### AI Tools Used

| Tool | Purpose | Integration |
|------|---------|-------------|
| **OpenAI GPT-4** | Primary language model | Direct API integration |
| **Custom Prompts** | Domain-specific guidance | Engineered for ESG + SQL |
| **Context Injection** | Schema awareness | Dynamic schema insertion |
| **Response Parsing** | Clean SQL extraction | Regex and string processing |
| **Error Recovery** | Fallback strategies | Multiple prompt attempts |

---

## Technical Design Decisions

### 1. Database Choice: SQLite
**Decision**: Use SQLite instead of PostgreSQL or MySQL

**Rationale**:
- **Simplicity**: Single file database, no server setup required
- **Performance**: Fast for read-heavy workloads typical in analytics
- **Portability**: Easy to share and deploy
- **Development Speed**: No configuration overhead
- **Sufficient Scale**: Handles typical ESG datasets efficiently

**Trade-offs**:
- Limited concurrent write support (not needed for this use case)
- No advanced analytics functions (can be extended later)

### 2. Backend Framework: FastAPI
**Decision**: FastAPI over Django or Flask

**Rationale**:
- **Performance**: Async support for AI API calls
- **Documentation**: Automatic API documentation generation
- **Type Safety**: Full type hint support with Pydantic
- **Modern**: Built for Python 3.8+ with latest best practices
- **AI-Friendly**: Excellent for ML/AI integration patterns

**Trade-offs**:
- Newer framework (less mature ecosystem than Django)
- Learning curve for async programming

### 3. Frontend Framework: React
**Decision**: React SPA over server-rendered alternatives

**Rationale**:
- **Interactivity**: Real-time chat interface requirements
- **Ecosystem**: Excellent component libraries and tooling
- **State Management**: Built-in hooks for complex state
- **Performance**: Virtual DOM for efficient updates
- **Developer Experience**: Hot reload, debugging tools

**Trade-offs**:
- SEO limitations (not relevant for internal tool)
- Bundle size considerations

### 4. Styling: styled-components
**Decision**: CSS-in-JS over traditional CSS or utility frameworks

**Rationale**:
- **Component Scope**: Styles scoped to components automatically
- **Dynamic Styling**: Props-based conditional styling
- **Theming**: Consistent design system support
- **TypeScript**: Full type safety for style properties

### 5. AI Provider: OpenAI
**Decision**: OpenAI GPT-4 over other language models

**Rationale**:
- **SQL Generation**: Excellent performance for code generation
- **Context Understanding**: Strong natural language comprehension
- **API Stability**: Reliable service with good documentation
- **Community**: Extensive examples and best practices

**Trade-offs**:
- Cost per API call
- External dependency
- Rate limiting considerations

---

## Project Structure

```
esg-chatbot/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── main.py                      # FastAPI application entry
├── setup.py                     # Automated setup script
├── debug_chatbot.py             # System diagnostic tool
├── .env                         # Environment file
├── Steel_Manufacturing_ESG_data.csv  # Sample data
├── logs/                        # Application logs
├── data/                        # Additional data files
├── app/                         # Backend application
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # REST API endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Configuration management
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py       # Database operations
│   ├── services/
│   │   ├── __init__.py
│   │   └── ai_service.py       # AI integration layer
│   └── models/
│       └── __init__.py
└── frontend/                    # React application
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js              # Main application
        ├── index.js            # Entry point
        ├── components/         # Reusable components
        │   ├── Header.js
        │   ├── Sidebar.js
        │   ├── ChatMessage.js
        │   ├── SuggestedQueries.js
        │   └── DataTable.js
        ├── pages/              # Page components
        │   ├── ChatPage.js
        │   └── DatabaseExplorer.js
        ├── services/           # API integration
        │   └── apiService.js
        ├── hooks/              # Custom React hooks
        │   └── useChat.js
        └── utils/              # Utility functions
            └── helpers.js
```

---

## API Documentation

### Core Endpoints

#### Chat Endpoint
```
POST /api/v1/chat
Content-Type: application/json

{
  "message": "Show me steel production data",
  "timestamp": "2025-09-07T21:30:00Z"
}

Response:
{
  "success": true,
  "message": "Show me steel production data",
  "response": "Here are the results...",
  "sql_query": "SELECT * FROM production LIMIT 100",
  "results": [...],
  "total_rows": 12,
  "timestamp": "2025-09-07T21:30:01Z"
}
```

#### Database Info
```
GET /api/v1/database/info

Response:
{
  "tables": ["production", "emission", "water_consumption"],
  "total_tables": 3
}
```

#### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

### Full API Documentation
Visit http://localhost:8000/docs for interactive Swagger documentation.

---

## Testing

### Automated Testing
```bash
# Run comprehensive system test
python debug_chatbot.py
```

This script validates:
- Environment configuration
- OpenAI API connectivity
- Database connection and schema
- AI service integration
- End-to-end query processing

### Manual Testing Queries
Try these example queries in the chat interface:

**Production Metrics**:
- "Show me steel production data"
- "What was the highest production month?"
- "Compare production between Q1 and Q2"

**Environmental Data**:
- "What are the CO2 emissions?"
- "Show me water consumption trends"
- "What types of waste were generated?"

**Equipment Performance**:
- "What is the equipment efficiency data?"
- "Show me power consumption by month"
- "Display fuel consumption by type"

### Performance Benchmarks
- **Database Query Time**: < 100ms for typical queries
- **AI Response Time**: 2-5 seconds (depends on OpenAI API)
- **Frontend Load Time**: < 2 seconds
- **Concurrent Users**: Supports 10+ simultaneous users

---

## Deployment

### Production Considerations

1. **Environment Variables**
   ```bash
   OPENAI_API_KEY=your_production_key
   DATABASE_URL=postgresql://user:pass@host:port/db  # For PostgreSQL
   HOST=0.0.0.0
   PORT=8000
   DEBUG=False
   ```

2. **Database Migration**
   - Replace SQLite with PostgreSQL for production scale
   - Implement proper database migrations
   - Add database connection pooling

3. **Security Enhancements**
   - Add authentication and authorization
   - Implement rate limiting
   - Add HTTPS/SSL termination
   - Sanitize AI-generated SQL queries

4. **Monitoring**
   - Add application performance monitoring
   - Implement structured logging
   - Set up health check endpoints
   - Monitor AI API usage and costs

### Docker Deployment (Future Enhancement)
```dockerfile
# Backend Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]

# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript for new frontend components
- Add docstrings to all functions
- Include unit tests for new features
- Update README for significant changes

### Development Setup
```bash
# Install development dependencies
pip install -r requirements-dev.txt  # If available
npm install --dev  # Frontend dev dependencies

# Run linting
pylint app/
eslint frontend/src/

# Run type checking
mypy app/
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **OpenAI** for providing the GPT API that powers the natural language processing
- **FastAPI** community for excellent documentation and examples
- **React** ecosystem for modern frontend development tools
- **Pandas** team for powerful data processing capabilities

---

## Support

For questions or support:
- Create an issue on GitHub
- Check the debug script output for troubleshooting
- Review the API documentation at `/docs` endpoint

---
