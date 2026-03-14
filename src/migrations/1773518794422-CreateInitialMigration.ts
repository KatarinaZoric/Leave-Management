import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialMigration1773518794422 implements MigrationInterface {
  name = 'CreateInitialMigration1773518794422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "leave_balance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "year" integer NOT NULL, "totalDays" integer NOT NULL, "usedDays" integer NOT NULL DEFAULT '0', "userId" uuid, CONSTRAINT "PK_3455e264c75148742540634aca2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL, "countsAsVacation" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_359223e0755d19711813cd07394" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_events_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" date NOT NULL, "endDate" date NOT NULL, "status" "public"."leave_events_status_enum" NOT NULL DEFAULT 'PENDING', "note" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "leaveTypeId" uuid, CONSTRAINT "PK_1086fd75886b8db0c0a570374dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'MANAGER', 'EMPLOYEE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "surname" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'EMPLOYEE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance" ADD CONSTRAINT "FK_620ca66613c38b15dd738d3027b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_events" ADD CONSTRAINT "FK_fb9bcef9fb0e3d7bda247064e83" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_events" ADD CONSTRAINT "FK_18659734e20b29951c4369a3e03" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "leave_events" DROP CONSTRAINT "FK_18659734e20b29951c4369a3e03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_events" DROP CONSTRAINT "FK_fb9bcef9fb0e3d7bda247064e83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance" DROP CONSTRAINT "FK_620ca66613c38b15dd738d3027b"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "leave_events"`);
    await queryRunner.query(`DROP TYPE "public"."leave_events_status_enum"`);
    await queryRunner.query(`DROP TABLE "leave_types"`);
    await queryRunner.query(`DROP TABLE "leave_balance"`);
  }
}
