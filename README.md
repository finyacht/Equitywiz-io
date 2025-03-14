# Waterfall Analysis Tool

A web application for analyzing equity waterfall distributions in various exit scenarios. This tool helps investors and founders understand how proceeds will be distributed among different share classes based on liquidation preferences, participation rights, and caps.

## Features

- Create and manage multiple share classes (Common, Preferred Series A, B, etc.)
- Define liquidation preferences, participation rights, and caps for each share class
- Add investment transactions with share counts and investment amounts
- Calculate detailed waterfall distributions for any exit value
- View summary distributions showing how much each share class receives
- Visualize distributions across a range of exit values with interactive charts

## Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML, CSS, JavaScript with Chart.js for visualizations
- **Templating**: EJS (Embedded JavaScript)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd waterfall-analysis-tool
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

1. Start the server:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Building for Production

The application uses a build process to minify and optimize JavaScript files for production:

1. Run the build script:
   ```
   npm run build
   ```

This will create minified versions of the JavaScript files in the `js` directory.

## Deployment Notes

### Handling WebSocket Dependencies

This project uses optional WebSocket-related dependencies (`bufferutil` and `utf-8-validate`) which can sometimes cause build failures in certain environments. These are marked as optional dependencies in `package.json`.

If you encounter build errors related to these packages:

1. Make sure you have the proper build tools installed for native modules
2. You can safely ignore these dependencies as they're optional performance enhancers
3. For Netlify deployments, the included `netlify.toml` configuration handles these dependencies

## Usage

1. **Share Classes**: Add different share classes (e.g., Common, Series A, Series B) with their respective preferences.
   - For preferred shares, set liquidation preference multiple, participation rights, and caps.
   - Set seniority to determine the order of liquidation preference payouts.

2. **Transactions**: Add investment transactions for each share class.
   - Specify the number of shares and investment amount.

3. **Calculate**: Enter an exit value and click "Calculate Distribution" to see how proceeds would be distributed.

4. **View Results**:
   - **Detailed Waterfall**: Step-by-step breakdown of the distribution process.
   - **Summary**: Total amount and percentage each share class receives.
   - **Distribution Chart**: Visualization of how distributions change across different exit values.

## License

ISC

## Author

Created by Amal Ganatra 