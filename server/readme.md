# SnackTrack Backend

This is the backend for the SnackTrack application, specifically designed for integration in college canteens.

## Features

- **Admin Management:** Endpoints for administrative functionalities.
- **Contractor Management:** APIs to manage contractors.
- **Billing:** Create, manage, and track bills with automated cron jobs.
- **Student Management:** Manage student data and profiles.
- **Menu Management:** CRUD operations for canteen menus.
- **Order Management:** Place, update, and live order updates.
- **Canteen Management:** Manage canteen details and operations with WebSockets.
- **Notifications:** Twilio Integration for SMS updates.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- A running MongoDB database
- A running Redis instance

### Installation

- **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd snacktrack-server
    ```

- **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Variables

Create a `.env` file in the root directory by copying the sample file:

```bash
cp .env.sample .env
```

Update the `.env` file with your secrets. Similarly, create a `.env.prod` file for production environment variables.

## Available Scripts

- `npm run dev`: Starts the development server with reloading using `nodemon`.
- `npm run start`: Starts the production server using `.env.prod`.

## API Documentation

The API routes are defined in the `src/Routes` directory. Each file corresponds to a feature (e.g., `bill.Router.js`). You can explore these files to see the available endpoints, request/response formats, and middleware used.

## Database

This project uses [Mongoose](https://mongoosejs.com/) as the ORM. The database schemas are defined in `src/Models`.

## Built With

- [Express.js](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ORM
- [Redis](https://redis.io/) - In-memory data structure store
- [Nodemailer](https://nodemailer.com/) - For sending emails
- [Bcrypt](https://www.npmjs.com/package/bcrypt) - For password hashing
- [JSON Web Token](https://jwt.io/) - For authentication
- [Twilio](https://www.twilio.com/) - For SMS notifications
- [Socket.io](https://socket.io/) - For real-time order updates
- [Node-cron](https://www.npmjs.com/package/node-cron) - For scheduling tasks

## Docker

The project includes a `Dockerfile` to build and run the application in a containerized environment.

- **Base Image:** `node:22-alpine`
- **Dependencies:** Caches `package.json` and `package-lock.json` to optimize dependency installation.
- **Exposure:** Exposes port `3000`.
- **Run:** Starts the application using `npm run start`.

To build the docker image run the following command:

```bash
docker build -t snacktrack-server .
```

To run the docker image run the following command:

```bash
docker run -d -p 3000:3000 --env-file .env snacktrack-server
```

To view logs of the running container:

```bash
docker logs -f snacktrack-server
```

## CI/CD

The CI/CD pipeline is defined in `.github/workflows/cicd.yml` and uses GitHub Actions. It automates the process of building and deploying the application to an AWS EC2 instance.

- **Trigger:** The workflow is triggered on pushes to the `main` branch.
- **Jobs:**
    - **`build-and-push`:**
        - Checks out the source code.
        - Logs in to Docker Hub.
        - Gets the application version from `package.json`.
        - Builds the Docker image.
        - Pushes the image to Docker Hub.
    - **`deploy`:**
        - Runs only on pushes to `main`.
        - Connects to the EC2 instance via SSH.
        - Pulls the latest image from Docker Hub.
        - Retarts the Docker container with the new image and environment variables.
