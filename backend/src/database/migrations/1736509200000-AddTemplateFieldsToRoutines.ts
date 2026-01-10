import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateFieldsToRoutines1736509200000 implements MigrationInterface {
  name = 'AddTemplateFieldsToRoutines1736509200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`routines\` ADD \`isTemplate\` tinyint NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE \`routines\` ADD \`templateCategory\` enum('strength', 'hypertrophy', 'endurance', 'cardio', 'flexibility', 'functional', 'full_body') NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`routines\` DROP COLUMN \`templateCategory\``);
    await queryRunner.query(`ALTER TABLE \`routines\` DROP COLUMN \`isTemplate\``);
  }
}
