import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNoteCardTable1745103142431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'note_card',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'title',
          type: 'varchar',
          isNullable: false,
          length: '255',
        },
        {
          name: 'sourceUrl',
          type: 'varchar',
          isNullable: true,
          length: '500',
        },
        {
          name: 'type',
          type: 'enum',
          enum: ['short', 'extended', 'note_card'],
          default: `'note_card'`,
        },
        {
          name: 'sourceType',
          type: 'enum',
          enum: ['youtube', 'article', 'podcast', 'book'],
          default: `'youtube'`,
        },
        {
          name: 'keyTakeaways',
          type: 'varchar',
          isArray: true,
          isNullable: true,
        },
        {
          name: 'thoughts',
          type: 'varchar',
          isArray: true,
          isNullable: true,
        },
        {
          name: 'tags',
          type: 'varchar',
          isArray: true,
          isNullable: true,
        },
        {
          name: 'thumbnailUrl',
          type: 'varchar',
          isNullable: true,
          length: '500',
        },
        {
          name: 'channelName',
          type: 'varchar',
          isNullable: true,
          length: '255',
        },
        {
          name: 'channelAvatar',
          type: 'varchar',
          isNullable: true,
          length: '500',
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'userId',
          type: 'uuid',
          isNullable: false,
        },
        {
          name: 'isIdeaLiked',
          type: 'boolean',
          isArray: true,
          default: `'{}'`,
        },
        {
          name: 'isLiked',
          type: 'boolean',
          default: false,
        },
        {
          name: 'isActive',
          type: 'boolean',
          default: true,
        },
      ],
      foreignKeys: [
        {
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('note_card');
  }
}
