import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverageToPayments1766409048652 implements MigrationInterface {
  name = 'AddCoverageToPayments1766409048652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add columns as nullable first
    await queryRunner.query(`ALTER TABLE \`payments\` ADD \`coverageStart\` date NULL`);
    await queryRunner.query(`ALTER TABLE \`payments\` ADD \`coverageEnd\` date NULL`);

    // Step 2: Fix existing data - populate coverageStart and coverageEnd from membership
    // Use NULLIF to convert '0000-00-00' to NULL, and COALESCE to use paymentDate as fallback
    await queryRunner.query(`
      UPDATE \`payments\` p
      LEFT JOIN \`memberships\` m ON p.membershipId = m.id
      SET 
        p.coverageStart = COALESCE(
          NULLIF(m.startDate, '0000-00-00'), 
          NULLIF(p.paymentDate, '0000-00-00'),
          CURDATE()
        ),
        p.coverageEnd = COALESCE(
          NULLIF(m.endDate, '0000-00-00'), 
          DATE_ADD(NULLIF(p.paymentDate, '0000-00-00'), INTERVAL 30 DAY),
          DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        )
      WHERE p.coverageStart IS NULL OR p.coverageEnd IS NULL
    `);

    // Step 3: Change columns to NOT NULL after populating data
    await queryRunner.query(`ALTER TABLE \`payments\` MODIFY \`coverageStart\` date NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`payments\` MODIFY \`coverageEnd\` date NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`coverageEnd\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`coverageStart\``);
  }
}
