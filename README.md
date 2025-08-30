# Resource Measurement - Next.js Application

This application has been successfully converted from Create React App to Next.js latest version with a robust backend architecture.

## Features

- **RIR Delegation Summary**: Analyze and visualize delegation data from Regional Internet Registries (RIRs)
- **Interactive Charts**: View delegation data through interactive charts using Chart.js
- **Data Processing**: Parse and process delegation statistics with configurable parameters
- **JSON-Based Storage**: Efficient JSON file storage for fast data retrieval
- **Automated Data Updates**: Daily automatic data synchronization from RIR sources
- **API-First Architecture**: RESTful APIs for data management and retrieval
- **Responsive Design**: Modern responsive interface built with Next.js

## Technologies Used

- **Next.js 15.5.2** - React framework with server-side rendering capabilities
- **React 19** - Latest React version for building user interfaces
- **TypeScript** - Type-safe JavaScript development
- **Chart.js** - Interactive charts and data visualization
- **Papa Parse** - CSV parsing for delegation data
- **Node-cron** - Task scheduling for automated data updates

## Architecture Overview

### Backend Services

1. **Data Store Layer** (`lib/simpleDataStore.ts`)
   - JSON-based file storage with optimized structure for delegation data
   - Efficient data organization for fast queries
   - Support for complex filtering and aggregation

2. **Automated Data Management**
   - Automated data fetching from RIR NRO stats
   - Data parsing and validation
   - Bulk database operations

3. **Cron Service** (`lib/cronService.ts`)
   - Daily data synchronization at 2 AM UTC
   - Background task management
   - Error handling and logging

### API Routes

- `GET /api/delegations` - Retrieve processed delegation data
- `POST /api/update-data` - Manually trigger data update
- `GET /api/update-data` - Check update status
- `POST /api/init` - Initialize background services

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resource_measurement
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Initialize the application:
   - Click "Initialize Application" to start background services
   - This will create the database and start daily data sync

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Application Usage

### Automatic Setup

The application automatically handles all setup when you visit the website:

1. **Auto-Initialization**: The system automatically:
   - Creates the JSON data store
   - Starts background cron jobs  
   - Fetches initial data from RIR sources

2. **Background Updates**: The system automatically:
   - Updates data daily at 2 AM UTC
   - Maintains fresh delegation records without user intervention

### Data Analysis

1. **Configure Parameters**:
   - Select RIR (Regional Internet Registry): apnic, ripe, arin, lacnic, afrinic
   - Choose country code (ISO 2-letter format)
   - Set start and end years for analysis

2. **Process Data**:
   - Click "Process" to analyze delegation data from the JSON store
   - View summary statistics for ASN, IPv4, and IPv6 delegations

3. **Visualize Results**:
   - Toggle chart data types (ASN, IPv4, IPv6)
   - View interactive bar charts
   - Show/hide detailed data tables

## Database Schema

### Delegations Table
- `rir`: Regional Internet Registry
- `country_code`: ISO country code
- `type`: Delegation type (asn, ipv4, ipv6)
- `value`: Resource value (IP address, ASN number)
- `size`: Resource size
- `date`: Delegation date
- `status`: Delegation status
- `entity`: Entity responsible for the delegation

### Data Updates Table
- Tracks daily update operations
- Stores update status and record counts
- Enables monitoring of data freshness

## API Documentation

### GET /api/delegations

Retrieve processed delegation data for analysis.

**Parameters:**
- `rir` (string): Regional Internet Registry
- `country` (string): Country code
- `yearStart` (number): Start year for analysis
- `yearEnd` (number): End year for analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": { "entity": { "asn": "5*", "ipv4": "10", "ipv6": "2*", "hasPrior": true } },
    "totalSummary": { "asn": 5, "ipv4": 10, "ipv6": 2 },
    "delegatedPrefixes": { "entity": { "ipv4": ["192.0.2.0/24"], "ipv6": ["2001:db8::/32"] } }
  }
}
```

### POST /api/update-data

Manually trigger data update from RIR sources.

**Response:**
```json
{
  "success": true,
  "message": "Data updated successfully",
  "recordsCount": 150000
}
```

### POST /api/init

Initialize background services and database.

**Response:**
```json
{
  "success": true,
  "message": "Application initialized successfully"
}
```

## Performance Optimizations

- **Database Indexing**: Optimized indexes for fast filtering and aggregation
- **Bulk Operations**: Efficient batch processing for large datasets
- **Caching**: Query result optimization for repeated requests
- **Incremental Updates**: Only fetch new data when needed

## Deployment Considerations

1. **Data Storage**: JSON files will be created in `/data` directory
2. **Cron Jobs**: Automatic start in production environment  
3. **File Permissions**: Ensure write access to data directory
4. **Monitoring**: Check logs for daily update status

## Future Enhancements

- Add Redis caching for improved performance
- Implement database migrations for schema updates
- Add monitoring and alerting for failed updates
- Support for multiple data sources
- Historical data analysis and trends
- Export functionality for charts and data
- User authentication and role-based access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly including API endpoints
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
