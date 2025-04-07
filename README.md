# Sublet Agent

**Sublet** is a platform that enables domain owners to monetize their domains by leasing subdomains to developers and businesses. This allows for the utilization of unused domains, turning them into revenue-generating assets.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

Sublet provides a streamlined process for domain owners to lease subdomains, offering developers and businesses access to desirable domain names that might otherwise be unavailable. This fosters a collaborative environment where domain resources are efficiently utilized.

## Features

- **Domain Monetization**: Earn revenue by leasing subdomains of your unused or underutilized domains.
- **Developer Access**: Developers can acquire subdomains on premium domains, enhancing their project's credibility.
- **Automated Management**: Simplifies the process of subdomain leasing with automated tools and configurations.

## Quick Start

### 1. **Create a free account**
   And get an API key [Sublet](https://sublet.june07.com/)
   ![image](https://github.com/user-attachments/assets/8249caae-a1e7-402f-a848-74833df8dcb4)

### 2. **Run the Agent**
   Setup a .env file:
```
     SUBLET_API_KEY=sublet-apikey-aef160a3-459f-4315-bc45-0e55d849ccc4 # Sublet API key should start with 'sublet-apikey-'
     SUBLET_API_URL=https://sublet-api.june07.com
     CLOUDFLARE_EMAIL=your-cloudflare-email # This data is never sent to the server
     CLOUDFLARE_API_TOKEN=your-cloudflare-api-token # This data is never sent to the server
```

Then run the docker container: 

```bash
docker run --env-file .env ghcr.io/june07/sublet
```
   
### 3. **Profit!** 
That is literally all you need to do to get going with monetizing your domains.



## Getting Started (development)

Follow these instructions to set up and run the Sublet application on your local machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/june07/sublet.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd sublet
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

### Configuration

1. **Environment Variables**:

   - Duplicate the `.env.example` file and rename it to `.env`:

     ```bash
     cp .env.example .env
     ```

   - Open the `.env` file and configure the necessary environment variables as per your setup.

2. **Docker Configuration**:

   - The project includes `docker-compose.yml` for production and `docker-compose.dev.yml` for development environments. Choose the appropriate configuration based on your needs.

### Running the Application

**Using Docker**:

- **Development Environment**:

  ```bash
  docker-compose -f docker-compose.dev.yml up
  ```

- **Production Environment**:

  ```bash
  docker-compose up
  ```

**Without Docker**:

1. **Start the Application**:

   ```bash
   npm start
   ```

2. **For Development** (with nodemon for automatic restarts):

   ```bash
   npm run dev
   ```

## Usage

Once the application is running:

- **Access the Dashboard**: Navigate to `http://localhost:PORT` (replace `PORT` with the configured port) to access the Sublet dashboard.
- **API Endpoints**: Refer to the API documentation (if available) for information on interacting with the Sublet API.

## Contributing

We welcome contributions to enhance Sublet. To contribute:

1. **Fork the Repository**.
2. **Create a New Branch**:

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make Your Changes**.
4. **Commit Your Changes**:

   ```bash
   git commit -m 'Add some feature'
   ```

5. **Push to the Branch**:

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Open a Pull Request**.

## License

This project is licensed under the [MIT License](LICENSE).
