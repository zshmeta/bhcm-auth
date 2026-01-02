# bhcmarkets - Advanced Trading Platform

## Overview
**bhcmarkets** is a production-grade trading platform designed to mimic the functionality of professional platforms like MetaTrader 4 (MT4) and cTrader. It features a modern, high-performance frontend built with React and a robust backend powered by Node.js, PostgreSQL, and Redis.

The platform includes:
-   **Real-time Market Data**: Streaming prices via WebSockets (Socket.IO).
-   **Order Management System (OMS)**: Support for Market and Limit orders, with a full matching engine.
-   **User Management**: Secure authentication (JWT), account balances, and an Admin Dashboard for funding.
-   **Workspace UI**: A customizable trading interface with charts, watchlists, and order entry panels.

## Architecture
-   **Frontend**: React, Vite, Styled Components.
-   **Backend**: Node.js (TypeScript).
-   **Database**: PostgreSQL (User/Order data), Redis (Market Data/Snapshots).
-   **Infrastructure**: Docker Compose for local development.

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose
-   Bun (optional, but recommended for monorepo management)

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    bun install
    ```

### Running the Platform
1.  **Start Infrastructure** (Postgres & Redis):
    ```bash
    npm run db:start
    ```
    *Note: If you encounter permission errors with Docker volumes on Linux, try running `sudo chown -R 1000:1000 pgdata` or removing the volume if it persists.*

2.  **Run Migrations**:
    ```bash
    npm run db:migrate
    ```

3.  **Start Development Servers**:
    ```bash
    npm run dev
    ```
    This will start:
    -   Frontend: http://localhost:5173
    -   Backend API: http://localhost:8080
    -   Market Data (HTTP + Socket.IO): http://localhost:8081

### Usage Guide
1.  **Register**: Go to `http://localhost:5173/auth` and create an account.
2.  **Fund Account**:
    -   Navigate to `http://localhost:5173/admin`.
    -   Find your user and click "Manage Funds".
    -   Deposit test funds (e.g., $10,000).
3.  **Trade**:
    -   Go to `http://localhost:5173/app/trade`.
    -   Select a symbol from the Watchlist.
    -   Use the Order Entry panel to buy or sell.
    -   View your positions in the Terminal panel.

## Troubleshooting
-   **Docker Permission Denied**: Ensure your user has permissions to the docker socket and the volume directories.
-   **Market Data Not Connecting**: Ensure the market-data service is running on port 8081 (see `packages/backend/src/market-data/config.ts`).
-   **Login Fails**: Check the backend logs for database connection errors.
