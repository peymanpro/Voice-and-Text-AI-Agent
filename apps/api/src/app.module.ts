import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createTypeOrmOptions } from "./database/typeorm-options.js";
import { HealthController } from "./health/health.controller.js";

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: createTypeOrmOptions })],
  controllers: [HealthController],
})
export class AppModule {}
