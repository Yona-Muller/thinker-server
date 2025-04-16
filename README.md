# Thinker Server

## Description

Thinker Server is a backend service built with NestJS that manages An App that helps people organize & generate their thoughts, ideas & learnings. The service handles pass creation, management, and distribution while integrating with Salesforce for data persistence.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- PostgreSQL
- Access to AWS S3 bucket

## Required Certificates & Keys

Place the following files in their respective directories:

### /certs

- `us-east-1-bundle.pem` - aws for db certificate

### /env

Create environment files based on your deployment environment:

- `.dev.env`
- `.prod.env`

## Environment Variables

Your environment files should include:

````env
# Database
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name


## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/thinker-server.git
cd thinker-server
````

2. Install dependencies:

```bash
npm install
```

3. Set up certificates and environment files as described above

## Running the Application

### Development Mode

```bash
# Development with local database
npm run start:db:local

# Development with dev database
npm run start:db:dev

# Watch mode
npm run start:dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api
```

## Development

### Code Formatting

```bash
npm run format
```

### Linting

```bash
npm run lint
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Directory Structure

```
thinker-server/
├── src/
│   ├── auth/           # Authentication related code
│   ├── notecards/     # NoteCards management
│   ├── users/      # Users management
│   └── database/     # DB integration
├── certs/              # Certificates for AWS
└── env/               # Environment configuration files
```

### Creating a New Migration

To create a new migration file:

```bash
npm run migration:create --name=YourMigrationName
```

example:

```
npm run migration:create --name=CreateUserTable
```

### Running Migrations

```bash
# Run migrations using development configuration
npm run migration:run:dev
```

The migration files will be created in `src/database/migration/`. Each migration should have an `up()` method for applying the changes and a `down()` method for reverting them.

Example migration file:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## Contributing

Please read our contributing guidelines before submitting pull requests.
