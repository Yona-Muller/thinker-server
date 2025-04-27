import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAuthTablesAndForeignKeys1745742620142 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const authTokensTable = await queryRunner.getTable('auth_tokens');
    if (authTokensTable) {
      const foreignKey = authTokensTable.foreignKeys.find((fk) => fk.columnNames.includes('user_id'));
      if (foreignKey) {
        await queryRunner.dropForeignKey('auth_tokens', foreignKey);
      }
    }

    const socialAccountsTable = await queryRunner.getTable('social_accounts');
    if (socialAccountsTable) {
      const foreignKey = socialAccountsTable.foreignKeys.find((fk) => fk.columnNames.includes('user_id'));
      if (foreignKey) {
        await queryRunner.dropForeignKey('social_accounts', foreignKey);
      }
    }

    const passwordResetsTable = await queryRunner.getTable('password_resets');
    if (passwordResetsTable) {
      const foreignKey = passwordResetsTable.foreignKeys.find((fk) => fk.columnNames.includes('email'));
      if (foreignKey) {
        await queryRunner.dropForeignKey('password_resets', foreignKey);
      }
    }

    // Then drop tables
    await queryRunner.dropTable('password_resets');
    await queryRunner.dropTable('social_accounts');
    await queryRunner.dropTable('auth_tokens');
    await queryRunner.dropTable('email_verifications');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
