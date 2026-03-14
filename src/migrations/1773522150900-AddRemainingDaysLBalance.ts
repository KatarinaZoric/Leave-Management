import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemainingDaysLBalance1773522150900 implements MigrationInterface {
  name = 'AddRemainingDaysLBalance1773522150900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_balance" ADD "remainingDays" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_balance" DROP COLUMN "remainingDays"`,
    );
  }
}
