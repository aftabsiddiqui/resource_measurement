# Resource Measurement - Next.js Application

This application has been successfully converted from Create React App to Next.js latest version.

## Features

- **RIR Delegation Summary**: Analyze and visualize delegation data from Regional Internet Registries (RIRs)
- **Interactive Charts**: View delegation data through interactive charts using Chart.js
- **Data Processing**: Parse and process delegation statistics with configurable parameters
- **Responsive Design**: Modern responsive interface built with Next.js

## Technologies Used

- **Next.js 15.5.2** - React framework with server-side rendering capabilities
- **React 19** - Latest React version for building user interfaces
- **TypeScript** - Type-safe JavaScript development
- **Chart.js** - Interactive charts and data visualization
- **Papa Parse** - CSV parsing for delegation data

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

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Application Usage

1. **Configure Parameters**:
   - Select RIR (Regional Internet Registry)
   - Choose country code
   - Set start and end years for analysis

2. **Process Data**:
   - Click "Process" to fetch and analyze delegation data
   - View summary statistics for ASN, IPv4, and IPv6 delegations

3. **Visualize Results**:
   - Toggle chart data types (ASN, IPv4, IPv6)
   - View interactive bar charts
   - Show/hide detailed data tables

## Architecture Changes

### From Create React App to Next.js

The application has been migrated from Create React App to Next.js with the following key changes:

1. **Project Structure**:
   - Moved from `src/` to `pages/` directory structure
   - Added Next.js configuration files
   - Implemented proper TypeScript support

2. **Routing**:
   - Migrated to Next.js file-based routing
   - Added `_app.tsx` and `_document.tsx` for custom app structure

3. **Build System**:
   - Replaced react-scripts with Next.js build system
   - Updated package.json scripts
   - Added ESLint configuration for Next.js

4. **Performance Improvements**:
   - Automatic code splitting
   - Optimized bundle sizes
   - Built-in image optimization support

5. **SEO & Accessibility**:
   - Added proper meta tags and page titles
   - Improved semantic HTML structure
   - Better social media sharing support

## File Structure

```
├── pages/
│   ├── _app.tsx          # Custom App component
│   ├── _document.tsx     # Custom Document structure
│   └── index.tsx         # Main application page
├── components/           # Reusable React components
├── public/              # Static assets
├── src/
│   └── styles.css       # Global styles
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Future Enhancements

- Add API routes for server-side data processing
- Implement data caching with Next.js built-in features
- Add more visualization options
- Implement export functionality for charts and data
- Add dark mode support
- Implement responsive mobile design improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
