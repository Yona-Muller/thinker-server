import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTables1745700700460 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Assuming users table already exists with columns:
    // id, email, password, role, etc.

    // Add OTP fields to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "otp_code" VARCHAR(6),
      ADD COLUMN IF NOT EXISTS "otp_expiration" TIMESTAMP;
    `);

    // Create email_verifications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "email_verifications" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "email_verification_code" CHAR(6) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      );
    `);

    // Create auth_tokens table to track JWT tokens (optional, for blacklisting)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auth_tokens" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "token_value" VARCHAR(500) NOT NULL,
        "token_type" VARCHAR(20) NOT NULL, -- 'SHORT' or 'LONG'
        "is_revoked" BOOLEAN DEFAULT FALSE,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);

    // Create social_accounts table for OAuth connections
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "social_accounts" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "provider" VARCHAR(50) NOT NULL, -- 'GOOGLE', 'APPLE', etc.
        "provider_user_id" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        UNIQUE ("provider", "provider_user_id")
      );
    `);

    // Create password_reset table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_resets" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) NOT NULL,
        "token" VARCHAR(100) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("token")
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_auth_tokens_user_id" ON "auth_tokens" ("user_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_social_accounts_user_id" ON "social_accounts" ("user_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_password_resets_email" ON "password_resets" ("email");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop auth_tokens table
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_tokens";`);

    // Drop social_accounts table
    await queryRunner.query(`DROP TABLE IF EXISTS "social_accounts";`);

    // Drop password_resets table
    await queryRunner.query(`DROP TABLE IF EXISTS "password_resets";`);

    // Drop email_verifications table
    await queryRunner.query(`DROP TABLE IF EXISTS "email_verifications";`);

    // Remove OTP columns from users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "otp_code",
      DROP COLUMN IF EXISTS "otp_expiration";
    `);
  }
}
