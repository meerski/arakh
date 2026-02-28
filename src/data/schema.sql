-- ============================================================
-- Arakh — PostgreSQL Schema
-- ============================================================

-- World state
CREATE TABLE IF NOT EXISTS worlds (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  current_tick BIGINT NOT NULL DEFAULT 0,
  era_name TEXT NOT NULL DEFAULT 'The Dawn',
  era_start_tick BIGINT NOT NULL DEFAULT 0,
  era_dominant_species UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  state JSONB NOT NULL DEFAULT '{}'
);

-- Regions
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES worlds(id),
  name TEXT NOT NULL,
  layer TEXT NOT NULL CHECK (layer IN ('surface', 'underwater', 'underground')),
  biome TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  elevation REAL NOT NULL,
  climate JSONB NOT NULL DEFAULT '{}',
  resources JSONB NOT NULL DEFAULT '[]',
  connections UUID[] NOT NULL DEFAULT '{}',
  hidden_locations JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX idx_regions_world ON regions(world_id);
CREATE INDEX idx_regions_layer ON regions(layer);

-- Species
CREATE TABLE IF NOT EXISTS species (
  id UUID PRIMARY KEY,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  taxonomy JSONB NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('flagship', 'notable', 'generated')),
  traits JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'extant' CHECK (status IN ('extant', 'endangered', 'extinct')),
  total_population BIGINT NOT NULL DEFAULT 0,
  genesis_elder_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_species_status ON species(status);
CREATE INDEX idx_species_tier ON species(tier);

-- Characters
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  species_id UUID NOT NULL REFERENCES species(id),
  player_id UUID,
  region_id UUID NOT NULL REFERENCES regions(id),
  family_tree_id UUID NOT NULL,

  born_at_tick BIGINT NOT NULL,
  died_at_tick BIGINT,
  cause_of_death TEXT,
  is_alive BOOLEAN NOT NULL DEFAULT TRUE,

  genetics JSONB NOT NULL DEFAULT '{}',
  health REAL NOT NULL DEFAULT 1.0,
  energy REAL NOT NULL DEFAULT 1.0,
  hunger REAL NOT NULL DEFAULT 0.0,

  parent_ids UUID[],
  child_ids UUID[] NOT NULL DEFAULT '{}',
  relationships JSONB NOT NULL DEFAULT '[]',
  inventory JSONB NOT NULL DEFAULT '[]',
  knowledge JSONB NOT NULL DEFAULT '[]',
  achievements JSONB NOT NULL DEFAULT '[]',
  fame REAL NOT NULL DEFAULT 0,
  is_genesis_elder BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_characters_species ON characters(species_id);
CREATE INDEX idx_characters_alive ON characters(is_alive);
CREATE INDEX idx_characters_region ON characters(region_id);
CREATE INDEX idx_characters_player ON characters(player_id);
CREATE INDEX idx_characters_family_tree ON characters(family_tree_id);

-- Family Trees
CREATE TABLE IF NOT EXISTS family_trees (
  id UUID PRIMARY KEY,
  species_id UUID NOT NULL REFERENCES species(id),
  owner_id UUID NOT NULL,
  root_character_id UUID NOT NULL REFERENCES characters(id),
  generations INT NOT NULL DEFAULT 1,
  members UUID[] NOT NULL DEFAULT '{}',
  is_extinct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_family_trees_owner ON family_trees(owner_id);

-- Cards (Soulbound)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id),
  owner_id UUID NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
  species_id UUID NOT NULL REFERENCES species(id),
  character_name TEXT NOT NULL,
  taxonomy JSONB NOT NULL,
  genetics JSONB NOT NULL,
  family_tree_position JSONB NOT NULL DEFAULT '{}',
  achievements JSONB NOT NULL DEFAULT '[]',
  heirlooms JSONB NOT NULL DEFAULT '[]',
  fame_score REAL NOT NULL DEFAULT 0,
  highlight_reel JSONB NOT NULL DEFAULT '[]',
  flavor_text TEXT NOT NULL DEFAULT '',
  cause_of_death TEXT,
  era TEXT NOT NULL DEFAULT '',
  born_at_tick BIGINT NOT NULL,
  died_at_tick BIGINT,
  soulbound_to UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_owner ON cards(owner_id);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_species ON cards(species_id);
CREATE INDEX idx_cards_soulbound ON cards(soulbound_to);

-- Owners
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  dynasty_score REAL NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES owners(id),
  current_character_id UUID,
  family_tree_id UUID,
  is_connected BOOLEAN NOT NULL DEFAULT FALSE,
  connected_at TIMESTAMPTZ
);

CREATE INDEX idx_players_owner ON players(owner_id);

-- World Events
CREATE TABLE IF NOT EXISTS world_events (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  region_ids UUID[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  tick BIGINT NOT NULL,
  effects JSONB NOT NULL DEFAULT '[]',
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_tick ON world_events(tick);
CREATE INDEX idx_events_level ON world_events(level);
CREATE INDEX idx_events_type ON world_events(type);

-- Populations per region
CREATE TABLE IF NOT EXISTS populations (
  region_id UUID NOT NULL REFERENCES regions(id),
  species_id UUID NOT NULL REFERENCES species(id),
  count BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (region_id, species_id)
);
