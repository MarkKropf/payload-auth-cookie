import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "admin_users" ADD COLUMN "email_verified" boolean DEFAULT false;
  ALTER TABLE "admin_users" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "app_users" ADD COLUMN "email_verified" boolean DEFAULT false;
  ALTER TABLE "app_users" ADD COLUMN "last_login_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "admin_users" DROP COLUMN "email_verified";
  ALTER TABLE "admin_users" DROP COLUMN "last_login_at";
  ALTER TABLE "app_users" DROP COLUMN "email_verified";
  ALTER TABLE "app_users" DROP COLUMN "last_login_at";`)
}
