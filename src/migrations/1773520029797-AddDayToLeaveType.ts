import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDayToLeaveType1773520029797 implements MigrationInterface {
  name = 'AddDayToLeaveType1773520029797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_events" ADD "days" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leave_events" DROP COLUMN "days"`);
  }
}
