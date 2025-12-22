import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverageToPayments1766409048652 implements MigrationInterface {
  name = 'AddCoverageToPayments1766409048652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Paso 1: Agregar columnas como nullable primero
    await queryRunner.query(`ALTER TABLE \`payments\` ADD \`coverageStart\` date NULL`);
    await queryRunner.query(`ALTER TABLE \`payments\` ADD \`coverageEnd\` date NULL`);

    // Paso 2: Fix de datos existentes - poblar coverageStart y coverageEnd desde membership
    // Usar NULLIF para convertir '0000-00-00' a NULL, y COALESCE para usar paymentDate como fallback
    await queryRunner.query(`
      UPDATE \`payments\` p
      INNER JOIN \`memberships\` m ON p.membershipId = m.id
      SET 
        p.coverageStart = COALESCE(NULLIF(m.startDate, '0000-00-00'), p.paymentDate, CURDATE()),
        p.coverageEnd = COALESCE(NULLIF(m.endDate, '0000-00-00'), DATE_ADD(p.paymentDate, INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY))
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
