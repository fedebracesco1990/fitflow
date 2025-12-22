import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverageToPayments1766409048652 implements MigrationInterface {
  name = 'AddCoverageToPayments1766409048652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Paso 1: Agregar columnas como nullable primero
    await queryRunner.query(`ALTER TABLE \`payments\` ADD \`coverageStart\` date NULL`);
    await queryRunner.query(`ALTER TABLE \`payments\` ADD \`coverageEnd\` date NULL`);

    // Paso 2: Fix de datos existentes - poblar coverageStart y coverageEnd desde membership
    await queryRunner.query(`
      UPDATE \`payments\` p
      INNER JOIN \`memberships\` m ON p.membershipId = m.id
      SET p.coverageStart = m.startDate, p.coverageEnd = m.endDate
    `);

    // Paso 3: Cambiar columnas a NOT NULL después de poblar datos
    await queryRunner.query(`ALTER TABLE \`payments\` MODIFY \`coverageStart\` date NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`payments\` MODIFY \`coverageEnd\` date NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`coverageEnd\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`coverageStart\``);
  }
}
