import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260126093942 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "featured_product" drop constraint if exists "featured_product_position_unique";`);
    this.addSql(`create table if not exists "featured_product" ("id" text not null, "position" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "featured_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_featured_product_position_unique" ON "featured_product" ("position") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_featured_product_deleted_at" ON "featured_product" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "featured_product" cascade;`);
  }

}
