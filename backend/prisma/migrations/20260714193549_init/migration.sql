-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "SubscriptionProvider" AS ENUM ('stripe', 'revenuecat');

-- CreateEnum
CREATE TYPE "TeamContext" AS ENUM ('raid', 'pvp_great', 'pvp_ultra', 'pvp_master');

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "lore_popups_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'pro',
    "provider" "SubscriptionProvider" NOT NULL,
    "provider_reference" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renews_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_teams" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "context" "TeamContext" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "saved_team_id" TEXT NOT NULL,
    "pokemon_species_id" INTEGER NOT NULL,
    "cp" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "iv_attack" INTEGER NOT NULL,
    "iv_defense" INTEGER NOT NULL,
    "iv_stamina" INTEGER NOT NULL,
    "fast_move" TEXT NOT NULL,
    "charge_move" TEXT NOT NULL,
    "slot_order" INTEGER NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_species" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "base_attack" INTEGER NOT NULL,
    "base_defense" INTEGER NOT NULL,
    "base_stamina" INTEGER NOT NULL,
    "flavor_text" TEXT NOT NULL,
    "sprite_url" TEXT NOT NULL,

    CONSTRAINT "pokemon_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_types" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_type_map" (
    "pokemon_species_id" INTEGER NOT NULL,
    "pokemon_type_id" INTEGER NOT NULL,

    CONSTRAINT "pokemon_type_map_pkey" PRIMARY KEY ("pokemon_species_id","pokemon_type_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainers_email_key" ON "trainers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_trainer_id_key" ON "subscriptions"("trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_types_name_key" ON "pokemon_types"("name");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_teams" ADD CONSTRAINT "saved_teams_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_saved_team_id_fkey" FOREIGN KEY ("saved_team_id") REFERENCES "saved_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_type_map" ADD CONSTRAINT "pokemon_type_map_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_type_map" ADD CONSTRAINT "pokemon_type_map_pokemon_type_id_fkey" FOREIGN KEY ("pokemon_type_id") REFERENCES "pokemon_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
