import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createTypeOrmOptions } from "./database/typeorm-options.js";
import { HealthController } from "./health/health.controller.js";
import { PersistenceModule } from "./database/persistence/persistence.module.js";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: createTypeOrmOptions }),
    PersistenceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
