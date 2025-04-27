import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RenameStatusToIsActive1745710041671 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'status', 'isActive');

    await queryRunner.changeColumn(
      'users',
      'isActive',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'isActive', 'status');

    await queryRunner.changeColumn(
      'users',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['ACTIVE', 'INACTIVE'],
        default: "'ACTIVE'",
      })
    );
  }
}
