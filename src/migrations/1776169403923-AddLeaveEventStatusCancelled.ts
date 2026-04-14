import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeaveEventStatusCancelled1776169403923 implements MigrationInterface {
    name = 'AddLeaveEventStatusCancelled1776169403923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."leave_events_status_enum" RENAME TO "leave_events_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."leave_events_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "leave_events" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "leave_events" ALTER COLUMN "status" TYPE "public"."leave_events_status_enum" USING "status"::"text"::"public"."leave_events_status_enum"`);
        await queryRunner.query(`ALTER TABLE "leave_events" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."leave_events_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."leave_events_status_enum_old" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "leave_events" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "leave_events" ALTER COLUMN "status" TYPE "public"."leave_events_status_enum_old" USING "status"::"text"::"public"."leave_events_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "leave_events" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."leave_events_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."leave_events_status_enum_old" RENAME TO "leave_events_status_enum"`);
    }

}
