import { MigrationInterface, QueryRunner } from "typeorm";

export class AddValidUntil1775200678923 implements MigrationInterface {
    name = 'AddValidUntil1775200678923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_balance" ADD "validUntil" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_balance" DROP COLUMN "validUntil"`);
    }

}
