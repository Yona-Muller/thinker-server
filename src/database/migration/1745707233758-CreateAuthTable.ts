import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAuthTable1745707233758 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create email_verifications table
    const emailVerificationsTable = new Table({
      name: 'email_verifications',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'email',
          type: 'varchar',
          isNullable: false,
          isUnique: true,
        },
        {
          name: 'email_verification_code',
          type: 'char',
          length: '6',
          isNullable: false,
        },
        {
          name: 'expires_at',
          type: 'timestamp',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    });
    await queryRunner.createTable(emailVerificationsTable);

    // Create auth_tokens table to track JWT tokens (optional, for blacklisting)
    const authTokensTable = new Table({
      name: 'auth_tokens',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'user_id',
          type: 'uuid',
          isNullable: false,
        },
        {
          name: 'token_value',
          type: 'varchar',
          length: '500',
          isNullable: false,
        },
        {
          name: 'token_type',
          type: 'varchar',
          length: '20',
          isNullable: false,
        },
        {
          name: 'is_revoked',
          type: 'boolean',
          default: false,
        },
        {
          name: 'expires_at',
          type: 'timestamp',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    });
    await queryRunner.createTable(authTokensTable);

    // Create social_accounts table for OAuth connections
    const socialAccountsTable = new Table({
      name: 'social_accounts',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'user_id',
          type: 'uuid',
          isNullable: false,
        },
        {
          name: 'provider',
          type: 'varchar',
          length: '50',
          isNullable: false,
        },
        {
          name: 'provider_user_id',
          type: 'varchar',
          length: '255',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    });
    await queryRunner.createTable(socialAccountsTable);

    // Create password_resets table
    const passwordResetsTable = new Table({
      name: 'password_resets',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'email',
          type: 'varchar',
          length: '255',
          isNullable: false,
        },
        {
          name: 'token',
          type: 'varchar',
          length: '100',
          isNullable: false,
        },
        {
          name: 'expires_at',
          type: 'timestamp',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    });
    await queryRunner.createTable(passwordResetsTable);

    await queryRunner.createForeignKey(
      'auth_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'social_accounts',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'password_resets',
      new TableForeignKey({
        columnNames: ['email'],
        referencedTableName: 'users',
        referencedColumnNames: ['email'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.dropTable('password_resets');
    await queryRunner.dropTable('social_accounts');
    await queryRunner.dropTable('auth_tokens');
    await queryRunner.dropTable('email_verifications');
  }
}
