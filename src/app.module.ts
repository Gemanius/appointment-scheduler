import { OrganizationModule } from './organization/organization.module';
import { AppointmentModule } from './appointment/appointment.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { PostgresDatabaseConfigDto } from './config/dto/database.config.dto';
import { OrganizationAppointmentEntity } from './appointment/entity/organization-appointment.entity';
import { OrganizationsEntity } from './organization/entity/organization.entity';
import { AppointmentsChangesHistoryEntity } from './appointment/entity/appointments-changes-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    OrganizationModule,
    AppointmentModule,
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
            OrganizationAppointmentEntity,
            OrganizationsEntity,
            AppointmentsChangesHistoryEntity,
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
            OrganizationAppointmentEntity,
            OrganizationsEntity,
            AppointmentsChangesHistoryEntity,
          ],
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
