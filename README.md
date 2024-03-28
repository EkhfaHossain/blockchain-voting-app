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

### 2. Install Dependencies

```bash
npm install

## Configure MetaMask
Ensure MetaMask is installed in your browser. Connect MetaMask to the local test network.

## Deploy Smart Contracts

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

## Run the Application

```bash
npm run dev

## Access the Application
Open your web browser and navigate to http://localhost:3000 to access the blockchain voting application.



