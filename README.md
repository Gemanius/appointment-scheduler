# Appointment App

This project is designed to handle appointments between organizations. It includes APIs to create new organizations, retrieve organization and its ID, and create appointments.

## Technologies

The application is built with the NestJS framework and implemented with Express.js. NestJS offers better performance and a cleaner structure compared to pure Express.js. Its functionality can be updated to Fastify, which offers higher speed than Express.js.

The database used is PostgreSQL, known for its high performance in handling relational data. Given the relational nature of the data, PostgreSQL is the preferred choice.

## Design Patterns and Architecture

A significant aspect of this project is the implementation of a Master-Slave architecture in PostgreSQL, leveraging the capabilities of TypeORM in NestJS. This approach follows the CQRS (Command Query Responsibility Segregation) principle by separating the read and write operations to improve performance and scalability.

### Master-Slave Architecture

- **Master Database**: Handles all write operations (Create, Update, Delete).
- **Slave Database(s)**: Handle all read operations (Select). These are replicas of the master database to distribute the read load and enhance performance.

### TypeORM Implementation

- **Repository Pattern**: Used to abstract database queries. The repositories are divided into read and write repositories.
  - **Write Repositories**: Manage transactions and write operations.
  - **Read Repositories**: Handle all read operations and are also available in write repositories for transactional consistency.

## Rules

For all mutations such as Post, Patch, and Delete, transactions will be run. If any errors occur, the application will roll back the transactions to ensure data integrity.

## How to Implement Master-Slave Architecture

1. **Setup PostgreSQL Master-Slave Replication**:
   - Ensure the PostgreSQL Docker is running and WAL (Write-Ahead Logging) streaming is configured for replication.
   
2. **Configure TypeORM**:
   - Set the connection options in the NestJS configuration to include both master and slave databases.
   - Define entities and repositories to use the appropriate database connection based on the operation type (read or write).

3. **Environment Configuration**:
   - Set the necessary environment variables in the Docker Compose file to manage master and slave connections.

## How to Run

1. Ensure that the PostgreSQL Docker is running with WAL_stream configured for master-slave replication.
2. Set the environment variables in the Docker Compose file.
3. Run `docker-compose up` to start the application.

## How to Test

1. Use `npm run test` to run the tests.
2. All database connections are mocked to ensure the tests are isolated and reliable.

## Conclusion

The Appointment App is a well-designed application for managing appointments between organizations. It utilizes the NestJS framework and PostgreSQL database, providing robust performance and a clean structure. The implementation of a Master-Slave architecture with TypeORM enhances scalability and performance, making it a reliable solution for handling relational data and high read/write loads.
