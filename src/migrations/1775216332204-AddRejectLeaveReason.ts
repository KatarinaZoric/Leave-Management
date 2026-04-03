import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRejectLeaveReason1775216332204 implements MigrationInterface {
    name = 'AddRejectLeaveReason1775216332204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_events" ADD "rejectReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_events" DROP COLUMN "rejectReason"`);
    }

}
