# Appointment App

This project is designed to handle appointments between organizations. It includes APIs to create new organizations, retrieve organization and its ID, and create appointments.

## Technologies

The application is built with the NestJS framework and implemented with Express.js. Compared to Python technologies, it offers better performance and has a cleaner structure than pure Express.js. Its functionality can be updated to Fastify, which has higher speed than Express.js.

The database used is PostgreSQL, which has high performance for relational data. Due to the type of data being relational, this database was preferred.

One of the design patterns used in this project is one of the concepts of CQRS. Although the command and query were not implemented, the databases were separated for read and write using Master-Slave replicas of PostgreSQL.

## Rules

For all mutations such as Post, Patch, and Delete, the transactions will be run, and if any errors occur, the application will roll back the transactions.

The application uses the repository pattern, which makes it cleaner. No logic was used in the repositories; they were only used for queries to the database.

Write and read repositories are separated, but read repositories can be found in write repositories, which are used in transactions. Due to this, they were put there.

## How to Run

1. Ensure that the Postgres Docker is running and WAL_stream is running.
2. Run `docker-compose up` to run the application.

## How to Test

1. Use `npm run test` to run the tests.
2. All connections to the database have been mocked.

## Conclusion

The Appointment App is a well-designed application that handles appointments between organizations. It uses the NestJS framework and PostgreSQL database, providing better performance and a cleaner structure. The application follows strict rules for mutations and uses the repository pattern to keep the code clean.
