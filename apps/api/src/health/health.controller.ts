import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import type { DataSource } from "typeorm";

@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get("live")
  live(): { status: "ok" } {
    return { status: "ok" };
  }

  @Get("ready")
  async ready(): Promise<{ status: "ok"; database: "ready" }> {
    try {
      await this.dataSource.query("SELECT 1");
      return { status: "ok", database: "ready" };
    } catch {
      throw new ServiceUnavailableException({
        status: "error",
        database: "unavailable",
      });
    }
  }
}
