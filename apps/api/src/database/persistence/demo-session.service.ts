import { createHash, randomBytes } from "node:crypto";

import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { DemoSessionEntity } from "../entities/demo-session.entity.js";

const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type IssuedDemoSession = {
  token: string;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
};

function digestToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

@Injectable()
export class DemoSessionService {
  constructor(
    @InjectRepository(DemoSessionEntity)
    private readonly sessions: Repository<DemoSessionEntity>,
  ) {}

  async issueSession(
    ttlMs = DEFAULT_SESSION_TTL_MS,
  ): Promise<IssuedDemoSession> {
    if (
      !Number.isSafeInteger(ttlMs) ||
      ttlMs <= 0 ||
      ttlMs > MAX_SESSION_TTL_MS
    ) {
      throw new BadRequestException(
        "Session lifetime must be a positive duration of at most 30 days.",
      );
    }

    const token = randomBytes(32).toString("base64url");
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlMs);
    const session = this.sessions.create({
      tokenHash: digestToken(token),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
    const saved = await this.sessions.save(session);

    return {
      token,
      sessionId: saved.id,
      createdAt: saved.createdAt,
      expiresAt: saved.expiresAt as string,
    };
  }

  async requireSession(token: string): Promise<DemoSessionEntity> {
    if (typeof token !== "string" || token.length < 32 || token.length > 256) {
      throw new UnauthorizedException("A valid demo session is required.");
    }

    const session = await this.sessions.findOne({
      where: { tokenHash: digestToken(token) },
    });

    if (
      !session ||
      (session.expiresAt !== null &&
        Date.parse(session.expiresAt) <= Date.now())
    ) {
      throw new UnauthorizedException("A valid demo session is required.");
    }

    return session;
  }
}
