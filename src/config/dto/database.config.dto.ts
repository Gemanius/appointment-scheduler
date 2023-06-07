export type PostgresDatabaseConfigDto = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
};

export type DatabaseConfigDto = {
  postgres_master: PostgresDatabaseConfigDto;
  postgres_slave: PostgresDatabaseConfigDto;
};
