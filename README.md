# Simple Authentication Web App

A clean and simple web application with login functionality that communicates with the authentication API.

## Features

- User-friendly login interface
- Authentication against the API database
- Session management
- Responsive design

## Setup

### Prerequisites

- Docker

### Running the Application

1. Clone this repository:
   ```
   git clone https://github.com/ervays/simple-auth-web-app.git
   cd simple-auth-web-app
   ```

2. Build and run the Docker container:
   ```
   docker build -t simple-auth-web-app .
   docker run -p 8080:8080 simple-auth-web-app
   ```

3. Access the web application at:
   ```
   http://localhost:8080
   ```

### Environment Configuration

The application expects the authentication API to be available. By default, it connects to:
```
http://localhost:5000
```

To specify a different API endpoint, use the `API_URL` environment variable:
```
docker run -p 8080:8080 -e API_URL=http://your-api-url:5000 simple-auth-web-app
```

## Default Login

The default admin credentials are:
- Username: admin
- Password: admin