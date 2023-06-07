import {
  DatabaseConfigDto,
  PostgresDatabaseConfigDto,
} from './dto/database.config.dto';

export default (): DatabaseConfigDto => ({
  postgres_master: {
    port: +(process.env.MASTER_DB_PORT || '5432'),
    host: process.env.MASTER_DB_HOST || 'localhost',
    user: process.env.MASTER_DB_USER || 'postgres',
    password: process.env.MASTER_DB_PASSWORD || 'postgres',
    name: process.env.MASTER_DB_NAME || 'db',
  },
  postgres_slave: {
    port: +(process.env.SLAVE_DB_PORT || '5432'),
    host: process.env.SLAVE_DB_HOST || 'localhost',
    user: process.env.SLAVE_DB_USER || 'postgres',
    password: process.env.SLAVE_DB_PASSWORD || 'postgres',
    name: process.env.SLAVE_DB_NAME || 'db',
  },
});
