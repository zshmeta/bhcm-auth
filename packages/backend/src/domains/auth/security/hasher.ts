/*
  hasher.ts
  Secret hashing utilities for passwords and refresh tokens.
  We choose bcrypt for MVP: widely available, hardware-resistant enough for now,
  and simple to configure. You can swap for argon2 later behind the same interface.
*/

import bcrypt from "bcryptjs";

export interface SecretHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hashed: string): Promise<boolean>;
}

export function createBcryptHasher(rounds: number): SecretHasher {
  return {
    async hash(plain: string) {
      // Educational note: higher rounds increase CPU cost; tune for your infra.
      return bcrypt.hash(plain, rounds);
    },
    async verify(plain: string, hashed: string) {
      return bcrypt.compare(plain, hashed);
    },
  };
}
