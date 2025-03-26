# Q-GET Backend

A comprehensive backend application for the Q-GET platform, providing API endpoints for financial product distribution, vendor management, user authentication, and notification services.

## 📋 Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Core Architecture](#core-architecture)
- [Setup and Installation](#setup-and-installation)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Services](#services)
- [Error Handling](#error-handling)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Contributing](#contributing)

## 🌐 Overview

Q-GET Backend is a Node.js/Express application built with TypeScript that supports a platform for users to discover and apply for financial products like credit cards, loans, and insurance. The system supports both customers and vendors with features including:

- User authentication and authorization
- Financial product catalog and searches
- Application processing and tracking
- Vendor management and billing
- Notifications system
- Real-time messaging
- Document management
- Integration with SBI and other financial institutions

## 🛠 Technologies

- **Core**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Cloud**: AWS (SQS, S3, EC2)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Validation**: Zod

## 📂 Project Structure

```
q-get-backend/
├── src/                      # Source code
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Application entry point
│   ├── env/                  # Environment configuration
│   ├── handlers/             # API endpoint handlers
│   ├── libs/                 # Core libraries
│   │   ├── constants/        # Application constants
│   │   ├── enums/            # Enumeration types
│   │   ├── error/            # Error handling
│   │   ├── services/         # Business logic services
│   │   │   ├── aws/          # AWS integration
│   │   │   ├── billing/      # Billing services
│   │   │   ├── cards/        # Card catalog services
│   │   │   ├── jwt/          # JWT authentication
│   │   │   ├── lead/         # Lead generation services
│   │   │   ├── mongo/        # MongoDB models and schemas
│   │   │   ├── notifications/# Notification services
│   │   │   ├── otp/          # OTP verification
│   │   │   ├── s3/           # S3 storage
│   │   │   ├── sms/          # SMS services
│   │   │   └── sqs/          # SQS messaging
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   └── validations/      # Input validation
│   ├── middlewares/          # Express middlewares
│   └── routing/              # API route definitions
├── bin/                      # Compiled JavaScript output
├── .github/                  # GitHub configuration
│   └── workflows/            # GitHub Actions workflows
├── Dockerfile                # Docker configuration
├── docker-compose.yaml       # Docker Compose configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.ts            # Jest testing configuration
└── package.json              # Project dependencies
```

## 🏗 Core Architecture

The application follows a layered architecture pattern:

1. **Routing Layer** (`src/routing`): Defines API endpoints and routes requests to appropriate handlers.
2. **Handler Layer** (`src/handlers`): Processes HTTP requests, validates inputs, and calls service methods.
3. **Service Layer** (`src/libs/services`): Contains business logic, database operations, and external integrations.
4. **Data Layer** (`src/libs/services/mongo`): Defines database schemas, models, and data access.

### Key Design Patterns

- **Repository Pattern**: Abstracts database operations through service classes.
- **Dependency Injection**: Services are injected into handlers.
- **Factory Pattern**: Used for creating instances of complex objects.
- **Singleton Pattern**: Used for database connections and shared services.

## 🚀 Setup and Installation

### Prerequisites

- Node.js (v14+)
- Yarn package manager
- MongoDB instance
- AWS account (for production)
- Docker (for containerized deployment)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/q-get-backend.git
   cd q-get-backend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # MongoDB
   MONGO_DB_URL=mongodb://localhost:27017/q-get

   # JWT
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRY=1d

   # AWS 
   AWS_REGION=us-east-1
   AWS_ACCOUNT_ID=your-account-id
   S3_BUCKET_NAME=your-bucket-name

   # SQS
   RAISE_INVOICE_SQS_QUEUE_NAME=raise-invoice-queue
   MESSAGE_QUEUE_NAME=message-queue

   # SMS
   SMS_API_URL=your-sms-api-url
   SMS_API_KEY=your-sms-api-key
   SMS_WELCOME_TEMPLATE_ID=your-template-id
   SMS_OTP_TEMPLATE_ID=your-otp-template-id
   SMS_SENDER_ID=QGET
   SMS_TATA_TEL_USERNAME=your-username
   SMS_TATA_TEL_PASSWORD=your-password
   SMS_TATA_TEL_PE_ID=your-pe-id

   # Application
   ORG_ID=your-org-id
   ```

4. Run the development server:
   ```bash
   yarn dev
   ```

5. Build for production:
   ```bash
   yarn build
   ```

### Docker Setup

1. Build Docker image:
   ```bash
   docker build -t q-get-backend .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## 📚 API Documentation

### Core API Endpoints

#### Authentication

- `POST /v1/otp` - Send or verify OTP for phone authentication
  - Actions: `SEND_OTP`, `VERIFY_OTP`

#### Users

- `GET /v1/getMe` - Get current user profile
- `GET /v1/users` - Get all users (admin)
- `PATCH /v1/user` - Update user information
- `DELETE /v1/user/:id` - Delete user

#### Applications

- `GET /v1/applications` - Query applications

#### Cards

- `GET /v1/getCards` - Get credit card products
- `POST /v1/createCard` - Create new card product

#### Dashboard

- `POST /v1/dashboard` - Get dashboard data for vendors

#### Notifications

- `GET /v1/notifications` - Get user notifications
- `POST /v1/notifications` - Create notification
- `PATCH /v1/notifications/:id` - Update notification
- `DELETE /v1/notifications/:id` - Delete notification
- `GET /v1/notifications/unread-count` - Get unread notification count
- `POST /v1/notifications/mark-all-read` - Mark all notifications as read

#### Partner (Vendor) Registration

- `POST /v1/partnerRegistration` - Register as a vendor partner

#### Messaging

- `GET /v1/usermessages` - Get user messages
- `POST /v1/usermessages` - Send message
- `DELETE /v1/usermessages/:id` - Delete message

#### Scans

- `GET /v1/scans` - Get QR scan information

#### Billing

- `POST /v1/invoices` - Create or manage invoices

### API Conventions

1. **Resource Naming**:
   - Resources are named using plural nouns (e.g., `users`, `applications`)
   - Actions use verbs (e.g., `getCards`, `createCard`)

2. **Request Structure**:
   - `GET` endpoints use query parameters for filtering
   - `POST`/`PATCH` endpoints use JSON request bodies
   - Many `POST` endpoints use an `action` field to specify the operation

3. **Response Structure**:
   - Success responses return HTTP 200/201 with JSON data
   - Error responses return appropriate HTTP status codes with message

4. **Pagination**:
   - Paginated endpoints support `page` and `limit` query parameters
   - Responses include `total` count for pagination

## 🔐 Authentication

The application uses JWT-based authentication with phone number OTP verification:

1. **OTP Generation and Verification**:
   - Client requests OTP via `POST /v1/otp` with `action: "SEND_OTP"`
   - SMS with OTP is sent to the provided phone number
   - Client verifies OTP via `POST /v1/otp` with `action: "VERIFY_OTP"`
   - Server generates JWT token upon successful verification

2. **JWT Authentication**:
   - All authenticated endpoints require `Authorization: Bearer <token>` header
   - JWT contains user phone number and expires based on `JWT_EXPIRY` setting
   - The `authorizeRequest` middleware validates the token and attaches user info

3. **Authorization**:
   - Access control is handled by the `isAuthorizedAccess` flag in handler classes
   - Vendor-specific endpoints check `userType === UserType.Vendor`

## 💾 Database Models

Key MongoDB models include:

### Users
Stores user information for both customers and vendors.

```typescript
{
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  alternatePhone?: string;
  vendorId?: string;
  userType: UserType; // "vendor" | "customer"
  isWelcomeMessageSent: boolean;
  status: UserStatus;
  scannedVendorId?: string;
  isVendorRegistrationRequestSent?: boolean;
  vendorRegistrationStatus?: VendorRegistrationStatus;
  vendorInfo?: any;
}
```

### Applications
Tracks financial product applications.

```typescript
{
  customerId: string;
  customerName: string;
  vendorId: string;
  bankId: string;
  phoneNumber: string;
  status: ApplicationStatus; // "APPROVED" | "PENDING" | "REJECTED" | "LOGIN" | "BILLED"
  applicationId: string;
  tenant: string;
  branchId: string;
  memershipshipId: string;
  createdByEmail: string;
  createdByName: string;
  bankName: string;
}
```

### Cards
Stores financial product information.

```typescript
{
  cardId: string;
  title: string;
  link: string;
  categories?: string[]
  bankName: string;
  imageUrl?: {
    s3Key: string;
    fileType: string;
    fileName: string;
    imageUrl: string;
  };
  bankLogo?: {...};
  type: "CODE" | "IMAGE";
  orientation: "PORTRAIT" | "LANDSCAPE";
  redirectParam?: string;
  benefits: {
    title: string;
    items: string[];
  };
  cardCode?: string;
}
```

### Notifications
Stores user notifications.

```typescript
{
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "system" | "user" | "promo" | "alert";
  status: "read" | "unread";
  additionalData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### VendorCredits
Tracks vendor commission and billing.

```typescript
{
  vendorId: string;
  credit: number;
  name: string;
  applicationId: string;
  status: VendorCreditStatus; // "TO_BE_RAISED" | "REJECTED" | "RAISED" | "PAID" | "APPROVED"
  bankInfo: {
    bankName: string;
    bankId: string;
  };
  invoiceReqId?: string;
  message?: string;
  amountPaid?: number;
  creditId: string;
}
```

## 🧩 Services

### Core Services

1. **AuthService (JWT)**:
   - Manages JWT token creation and validation
   - Handles user authentication

2. **UserService**:
   - Manages user creation, retrieval, and updates
   - Handles vendor registration requests

3. **ApplicationsService**:
   - Manages financial product applications
   - Handles application status updates

4. **CardService**:
   - Manages card catalog and searches
   - Handles card creation and updates

5. **DashboardService**:
   - Generates vendor dashboard data
   - Aggregates metrics and KPIs

6. **NotificationService**:
   - Manages user notifications
   - Handles notification status updates

7. **BillingService**:
   - Manages vendor credits and invoices
   - Integrates with SQS for invoice processing

8. **SmsClient**:
   - Handles SMS delivery for OTP and notifications
   - Manages SMS templates

### Integration Services

1. **S3Service**:
   - Handles file uploads to S3
   - Generates presigned URLs

2. **SqsService**:
   - Handles SQS message publishing
   - Manages event-driven workflows

3. **MongoDbClient**:
   - Manages MongoDB connections
   - Provides database access

## 🚨 Error Handling

The application uses a centralized error handling approach:

1. **Custom Error Classes**:
   - `BadRequestExecption`: Invalid input (400)
   - `UnauthorizedException`: Authentication failure (401)
   - `DbError`: Database errors (500)
   - `NotProvidedError`: Missing required fields (400)
   - `ConnectionError`: Connection issues (500)
   - `ConflictException`: Resource conflicts (409)

2. **Error Middleware**:
   - Centralized error handler in `src/libs/error/errorHandler.ts`
   - Converts errors to appropriate HTTP responses
   - Handles Zod validation errors

3. **Try-Catch Pattern**:
   - All async operations use try-catch blocks
   - Errors are passed to the next middleware

## 🐳 Docker Deployment

The application is containerized using Docker:

1. **Dockerfile**:
   - Multi-stage build process
   - Node 'build' stage for TypeScript compilation
   - Node 'slim' runtime for production deployment
   - PM2 for process management

2. **Docker Compose**:
   - Defines the application service
   - Configures port mapping
   - Loads environment variables from `.env`

3. **GitHub Actions Workflow**:
   - Automates Docker image building
   - Pushes to Docker Hub
   - Deploys to EC2 instance

## 🧪 Testing

The project uses Jest for unit and integration testing:

1. **Test Structure**:
   - Tests are located alongside the code they test
   - Naming convention: `*.test.ts`

2. **Mocking**:
   - MongoDB models are mocked for unit tests
   - External services are mocked

3. **Running Tests**:
   ```bash
   yarn test
   ```

## 🔄 CI/CD

The project uses GitHub Actions for CI/CD:

1. **.github/workflows/deploy.yaml**:
   - Triggers on pushes to `main` branch
   - Builds Docker image
   - Pushes to Docker Hub
   - Deploys to EC2 using SSH

2. **Deployment Process**:
   - Docker Compose is used on the EC2 instance
   - Pulls the latest image
   - Updates the running container

## 📝 Contributing

### Coding Conventions

1. **TypeScript**:
   - Use strongly typed interfaces and types
   - Avoid `any` type where possible
   - Use async/await for asynchronous code

2. **Class Structure**:
   - Handler classes implement `IHandler` interface
   - Services use dependency injection
   - Use constructor binding for methods

3. **Naming Conventions**:
   - CamelCase for variables and functions
   - PascalCase for classes and interfaces
   - Constants in UPPER_CASE
   - Files in kebab-case

4. **Error Handling**:
   - Use custom error classes
   - Always catch and handle exceptions
   - Always include error messages

### Git Workflow

1. Create feature branches from `main`
2. Use conventional commit messages
3. Submit pull requests for review
4. Squash merge to `main`

## 🔮 Extending the System

### Adding New API Endpoints

1. Create handler classes in `src/handlers/{resource}`
2. Implement the `IHandler` interface
3. Define validation schemas with Zod
4. Register handlers in `src/routing/routes.ts`

### Adding New Database Models

1. Define types in `src/libs/services/mongo/types.ts`
2. Create schema in `src/libs/services/mongo/models/{model}.ts`
3. Create service class in `src/libs/services/{service}/service.ts`

### Adding New Notification Types

1. Update the `SystemEventType` enum in `src/libs/utils/notificationUtils.ts`
2. Add handling logic in `createSystemNotification` method
3. Integrate with relevant services

---


## 📄 License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents of this repository is prohibited.

© N-OMS. All rights reserved.