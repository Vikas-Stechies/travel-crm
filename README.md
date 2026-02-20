# Travel CRM

This is a comprehensive guide for setting up and running the Travel CRM application, which includes both a React Native Expo front-end and an Express.js back-end.

## Prerequisites
- Node.js (v14 or later)
- npm (Node Package Manager)
- Expo CLI (You can install it globally using `npm install -g expo-cli`)
- MongoDB (for database management, if used by your Express backend)

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Vikas-Stechies/travel-crm.git
cd travel-crm
```

### 2. Set Up the Backend
- Navigate to the backend directory:
```bash
cd backend
```
- Install the dependencies:
```bash
npm install
```
- Create a `.env` file in the backend directory and add the required environment variables (like MongoDB connection string, secret keys, etc.). You can refer to the `.env.example` file for guidance.
- Start the Express server:
```bash
npm start
```
This usually runs the server on `http://localhost:5000`.

### 3. Set Up the Frontend
- Open a new terminal window and navigate to the frontend directory:
```bash
cd ../frontend
```
- Install the dependencies:
```bash
npm install
```
- Start the Expo development server:
```bash
expo start
```
This will provide a URL (usually `http://localhost:3000`) where you can access the app on your mobile device or simulator.

### 4. Running the Application
- Open the Expo Go app on your mobile device or use an emulator.
- Scan the QR code displayed in the terminal or browser window opened by the Expo CLI.

## Additional Notes
- Make sure that the Express backend is running while you are testing the React Native app.
- For Apple devices, ensure that you have the proper permissions set in your development environment.

## Troubleshooting
- If you encounter issues, check the console output for errors.
- Ensure the correct versions of Node.js and Expo are installed.
- Consult the documentation for both Expo and Express for any additional setup requirements.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
