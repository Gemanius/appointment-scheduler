import { OrganizationModule } from './organization/organization.module';
import { AppoinmentModule } from './appoinment/appoinment.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { PostgresDatabaseConfigDto } from './config/dto/database.config.dto';
import { OrganizationAppoinmentEntity } from './appoinment/entity/organization-appoinment.entity';
import { OrganizationsEntity } from './organization/entity/organization.entity';
import { AppoinmentsChangesHistoryEntity } from './appoinment/entity/appoinments-changes-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    OrganizationModule,
    AppoinmentModule,
    TypeOrmModule.forRootAsync({
      name: 'write_db',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configs: PostgresDatabaseConfigDto =
          configService.get('postgres_master');
        return {
          type: 'postgres',
          host: configs.host,
          port: configs.port,
          username: configs.user,
          password: configs.password,
          database: configs.name,
          entities: [
            OrganizationAppoinmentEntity,
            OrganizationsEntity,
            AppoinmentsChangesHistoryEntity,
          ],
          synchronize: true,
        };
      },
    }),

    TypeOrmModule.forRootAsync({
      name: 'read_db',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configs = configService.get('postgres_slave');
        return {
          type: 'postgres',
          host: configs.host,
          port: configs.port,
          username: configs.user,
          password: configs.password,
          database: configs.name,
          entities: [
            OrganizationAppoinmentEntity,
            OrganizationsEntity,
            AppoinmentsChangesHistoryEntity,
          ],
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
