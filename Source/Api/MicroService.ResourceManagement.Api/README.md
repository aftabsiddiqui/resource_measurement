# Resource Measurement Backend

This ASP.NET Web API project (C#, .NET 9) uses Entity Framework Core and SQL Server Express to fetch, process, and store data from the RIPE delegated stats URL. It exposes endpoints for the React frontend to consume. The solution includes Docker Compose for easy deployment with the frontend and SQL Server Express.

## Features
- Fetches and parses delegated stats from https://ftp.ripe.net/pub/stats/ripencc/nro-stats/latest/nro-delegated-stats
- Stores processed data in SQL Server Express using Entity Framework Core
- Exposes REST API endpoints for frontend consumption
- Docker Compose setup for backend, frontend, and SQL Server Express

## How to Run
1. Build and run with Docker Compose:
   ```sh
   docker-compose up --build
   ```
2. Access the React frontend at `http://localhost:3000` (default)
3. Backend API available at `http://localhost:5000/api/...`

## Project Structure
- `/backend` - ASP.NET Web API backend
- `/frontend` - React frontend
- `/docker-compose.yml` - Multi-container orchestration

## Notes
- Replace connection strings and environment variables as needed for production.
- See copilot-instructions.md in `.github` for workspace automation details.
