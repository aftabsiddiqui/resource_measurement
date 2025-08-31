# Resource Measurement Frontend

This React app visualizes RIR delegated stats by consuming the backend API. It is designed to run alongside the backend and SQL Server Express using Docker Compose.

## How to Run
- Use Docker Compose from the project root to start all services together.
- The frontend will connect to the backend API at `http://localhost:5000/api`.

## Project Structure
- `/frontend` - React frontend
- `/backend` - ASP.NET Web API backend
- `/docker-compose.yml` - Multi-container orchestration

## Notes
- Set `REACT_APP_API_URL` in your environment to point to the backend API.
- See copilot-instructions.md in `.github` for workspace automation details.
