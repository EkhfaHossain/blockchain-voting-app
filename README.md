# Blockchain Voting Application

## Introduction
This repository contains the source code for a blockchain-based voting application. The application utilizes technologies such as MetaMask for wallet integration, Hardhat for local blockchain deployment, Next.js for frontend development, and Ethereum smart contracts for managing the voting process.

## Prerequisites
Before setting up the application, ensure you have the following prerequisites installed:
- Node.js
- MetaMask browser extension
- Hardhat
- Next.js

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository_url>
cd <repository_directory>
```

### 2. Install Dependencies
```bash
npm install
```
or
```bash
yarn install
```

### 3. Configure MetaMask
Ensure MetaMask is installed in your browser. Connect MetaMask to the local test network.

### 4. Deploy Smart Contracts
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Run the Application
```bash
npm run dev
```
or
```bash
yarn dev
```

### 6. Access the Application
Open your web browser and navigate to [http://localhost:3000](http://localhost:3000) to access the blockchain voting application.

## Features
Once the application is running, users can perform the following actions:
- Connect their MetaMask wallet to the application.
- Register as a voter by providing necessary details and uploading an image.
- View the list of registered voters.
- Register as a candidate by providing necessary details and uploading an image.
- View the list of registered candidates.
- Cast their votes for preferred candidates.
- Start and end the voting period (admin functionality).
- Determine the winner of the election.


## Conclusion
This documentation provides a comprehensive guide for setting up and running a blockchain voting application. By following these steps, users can deploy their own decentralized voting system.





