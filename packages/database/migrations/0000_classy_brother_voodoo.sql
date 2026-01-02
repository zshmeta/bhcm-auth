CREATE TYPE "public"."account_status" AS ENUM('active', 'locked', 'closed');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('spot', 'margin', 'futures', 'demo');--> statement-breakpoint
CREATE TYPE "public"."order_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'partially_filled', 'filled', 'cancelled', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('market', 'limit', 'stop', 'take_profit');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'support');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'pending', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"currency" varchar(10) NOT NULL,
	"balance" numeric(30, 10) DEFAULT '0' NOT NULL,
	"locked" numeric(30, 10) DEFAULT '0' NOT NULL,
	"account_type" "account_type" DEFAULT 'spot' NOT NULL,
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_prices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"price" numeric(30, 10) NOT NULL,
	"currency" varchar(10),
	"source" varchar(32),
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"symbol" varchar(64) NOT NULL,
	"side" "order_side" NOT NULL,
	"type" "order_type" NOT NULL,
	"price" numeric(30, 10),
	"quantity" numeric(30, 10) NOT NULL,
	"filled_quantity" numeric(30, 10) DEFAULT '0' NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"time_in_force" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"symbol" varchar(64) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(30, 10) DEFAULT '0' NOT NULL,
	"entry_price" numeric(30, 10),
	"unrealized_pnl" numeric(30, 10) DEFAULT '0',
	"realized_pnl" numeric(30, 10) DEFAULT '0',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_user" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_market_prices_symbol_time" ON "market_prices" USING btree ("symbol","timestamp");--> statement-breakpoint
CREATE INDEX "idx_orders_account" ON "orders" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_orders_symbol" ON "orders" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_positions_account_symbol" ON "positions" USING btree ("account_id","symbol");