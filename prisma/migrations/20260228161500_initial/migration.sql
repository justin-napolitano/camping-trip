-- Required extensions for search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enums
CREATE TYPE packability_mode AS ENUM ('portable_volume_based', 'portable_weight_only', 'non_packable');
CREATE TYPE source_type AS ENUM ('internal_admin', 'field_note', 'third_party_review', 'manufacturer_spec');
CREATE TYPE trip_type AS ENUM ('weekend_backpacking', 'day_climb_car_camp', 'alpine_weekend');
CREATE TYPE precipitation_risk AS ENUM ('low', 'medium', 'high', 'wintry');
CREATE TYPE remoteness AS ENUM ('frontcountry', 'semi_remote', 'remote');
CREATE TYPE static_exposure AS ENUM ('low', 'medium', 'high');
CREATE TYPE field_test_type AS ENUM ('sleep_overnight', 'stove_cold_start');
CREATE TYPE moderation_status AS ENUM ('visible', 'flagged', 'hidden', 'quarantined');
CREATE TYPE location_type AS ENUM ('crag', 'park', 'campground', 'region', 'other');
CREATE TYPE clothing_level AS ENUM ('L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7');
CREATE TYPE shelter_level AS ENUM ('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7');
CREATE TYPE sleep_level AS ENUM ('SL1', 'SL2', 'SL3', 'SL4', 'SL5', 'SL6', 'SL7');
CREATE TYPE cooking_level AS ENUM ('C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7');
CREATE TYPE water_level AS ENUM ('W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7');
CREATE TYPE navigation_level AS ENUM ('N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7');
CREATE TYPE medical_level AS ENUM ('M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7');

CREATE TABLE gear_class (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  required_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE system (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deprecated_at timestamptz,
  deprecated_by text,
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE system_alias (
  id uuid PRIMARY KEY,
  alias text NOT NULL UNIQUE,
  system_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL,
  CONSTRAINT system_alias_system_id_fkey FOREIGN KEY (system_id) REFERENCES system(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE location (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  country_code text NOT NULL,
  region_code text,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  parent_location_id uuid,
  location_type location_type NOT NULL DEFAULT 'other',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT location_parent_location_id_fkey FOREIGN KEY (parent_location_id) REFERENCES location(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE gear_item (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  model text,
  gear_class_id uuid NOT NULL,
  price_usd numeric(10,2) NOT NULL,
  purchase_url text,
  weight_g integer NOT NULL,
  packed_volume_l numeric(6,2),
  packability_mode packability_mode NOT NULL,
  insulation_type text,
  fill_weight_g integer,
  fill_power integer,
  waterproof_mmv integer,
  seam_sealed boolean,
  breathability_gm2 integer,
  features_present jsonb NOT NULL DEFAULT '[]'::jsonb,
  canonical_search_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT gear_item_gear_class_id_fkey FOREIGN KEY (gear_class_id) REFERENCES gear_class(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE gear_item_system (
  gear_item_id uuid NOT NULL,
  system_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (gear_item_id, system_id),
  CONSTRAINT gear_item_system_gear_item_id_fkey FOREIGN KEY (gear_item_id) REFERENCES gear_item(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT gear_item_system_system_id_fkey FOREIGN KEY (system_id) REFERENCES system(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE review_intel (
  id uuid PRIMARY KEY,
  gear_item_id uuid NOT NULL,
  gear_class_id uuid NOT NULL,
  location_id uuid NOT NULL,
  author_id text NOT NULL,
  review_date date NOT NULL,
  source_type source_type NOT NULL,
  source_url text,
  rating integer NOT NULL,
  conditions_observed text NOT NULL,
  durability integer NOT NULL,
  value integer NOT NULL,
  packability integer NOT NULL,
  usage_cycles_observed numeric(10,2),
  usage_runtime_hours numeric(10,2),
  failure_event_count integer,
  repair_event_count integer,
  pros jsonb NOT NULL DEFAULT '[]'::jsonb,
  cons jsonb NOT NULL DEFAULT '[]'::jsonb,
  use_case text NOT NULL,
  evidence_quality_score numeric(3,2),
  curation_rank integer,
  composite_score numeric(4,3),
  confidence_score numeric(4,3),
  review_count integer NOT NULL DEFAULT 1,
  moderation_status moderation_status NOT NULL DEFAULT 'visible',
  moderation_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT review_intel_gear_item_id_fkey FOREIGN KEY (gear_item_id) REFERENCES gear_item(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT review_intel_gear_class_id_fkey FOREIGN KEY (gear_class_id) REFERENCES gear_class(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT review_intel_location_id_fkey FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT review_intel_source_url_check CHECK (
    source_type NOT IN ('third_party_review', 'manufacturer_spec') OR source_url IS NOT NULL
  )
);

CREATE TABLE review_intel_system (
  review_intel_id uuid NOT NULL,
  system_id uuid NOT NULL,
  PRIMARY KEY (review_intel_id, system_id),
  CONSTRAINT review_intel_system_review_intel_id_fkey FOREIGN KEY (review_intel_id) REFERENCES review_intel(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT review_intel_system_system_id_fkey FOREIGN KEY (system_id) REFERENCES system(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE trip_profile (
  id uuid PRIMARY KEY,
  location_id uuid NOT NULL,
  trip_type trip_type NOT NULL,
  expected_low_c numeric(5,2) NOT NULL,
  wind_mph numeric(5,2) NOT NULL,
  precipitation_risk precipitation_risk NOT NULL,
  remoteness remoteness NOT NULL,
  static_exposure static_exposure NOT NULL,
  precipitation_expected boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT trip_profile_location_id_fkey FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE field_test_log (
  id uuid PRIMARY KEY,
  gear_item_id uuid NOT NULL,
  test_type field_test_type NOT NULL,
  test_date date NOT NULL,
  expected_low_c numeric(5,2) NOT NULL,
  passed boolean NOT NULL,
  notes text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT field_test_log_gear_item_id_fkey FOREIGN KEY (gear_item_id) REFERENCES gear_item(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE capability_policy (
  id uuid PRIMARY KEY,
  policy_version text NOT NULL UNIQUE,
  medical_mild_min_c numeric(4,1) NOT NULL DEFAULT 35,
  medical_mild_max_c numeric(4,1) NOT NULL DEFAULT 32,
  medical_moderate_min_c numeric(4,1) NOT NULL DEFAULT 32,
  medical_moderate_max_c numeric(4,1) NOT NULL DEFAULT 28,
  medical_severe_lt_c numeric(4,1) NOT NULL DEFAULT 28,
  sleep_r_thresholds_json jsonb NOT NULL,
  fuel_buffer_multiplier numeric(4,2) NOT NULL DEFAULT 1.3,
  field_test_recency_days integer NOT NULL DEFAULT 180,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homepage_kit_bundle (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  context_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE homepage_kit_item (
  id uuid PRIMARY KEY,
  homepage_kit_bundle_id uuid NOT NULL,
  gear_item_id uuid NOT NULL,
  system_id uuid NOT NULL,
  suitability_score numeric(4,3) NOT NULL,
  top_factors jsonb NOT NULL,
  hard_rule_summary jsonb NOT NULL,
  purchase_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT homepage_kit_item_homepage_kit_bundle_id_fkey FOREIGN KEY (homepage_kit_bundle_id) REFERENCES homepage_kit_bundle(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT homepage_kit_item_gear_item_id_fkey FOREIGN KEY (gear_item_id) REFERENCES gear_item(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT homepage_kit_item_system_id_fkey FOREIGN KEY (system_id) REFERENCES system(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE curation_entry (
  id uuid PRIMARY KEY,
  context_key text NOT NULL,
  gear_item_id uuid NOT NULL,
  curation_rank integer NOT NULL,
  rationale text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT curation_entry_gear_item_id_fkey FOREIGN KEY (gear_item_id) REFERENCES gear_item(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE media_asset (
  id uuid PRIMARY KEY,
  gear_item_id uuid,
  review_intel_id uuid,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  storage_key text,
  moderation_status moderation_status NOT NULL DEFAULT 'hidden',
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_asset_gear_item_id_fkey FOREIGN KEY (gear_item_id) REFERENCES gear_item(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT media_asset_review_intel_id_fkey FOREIGN KEY (review_intel_id) REFERENCES review_intel(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE import_job (
  id uuid PRIMARY KEY,
  import_type text NOT NULL,
  status text NOT NULL,
  rows_received integer NOT NULL DEFAULT 0,
  rows_imported integer NOT NULL DEFAULT 0,
  error_report jsonb,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log_event (
  id uuid PRIMARY KEY,
  actor_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  event_type text NOT NULL,
  before_summary jsonb,
  after_summary jsonb,
  diff_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX review_intel_idempotency_unique ON review_intel (gear_item_id, location_id, review_date, author_id, source_type);

CREATE INDEX review_intel_gear_item_updated_idx ON review_intel (gear_item_id, updated_at DESC);
CREATE INDEX review_intel_location_updated_idx ON review_intel (location_id, updated_at DESC);
CREATE INDEX review_intel_composite_confidence_idx ON review_intel (composite_score DESC, confidence_score DESC);

CREATE INDEX system_alias_system_id_idx ON system_alias (system_id);
CREATE INDEX location_parent_location_id_idx ON location (parent_location_id);
CREATE INDEX gear_item_gear_class_id_idx ON gear_item (gear_class_id);
CREATE INDEX gear_item_system_system_id_idx ON gear_item_system (system_id);
CREATE INDEX review_intel_gear_class_id_idx ON review_intel (gear_class_id);
CREATE INDEX review_intel_moderation_status_idx ON review_intel (moderation_status);
CREATE INDEX review_intel_system_system_id_idx ON review_intel_system (system_id);
CREATE INDEX trip_profile_location_id_idx ON trip_profile (location_id);
CREATE INDEX field_test_log_gear_item_id_idx ON field_test_log (gear_item_id);
CREATE INDEX homepage_kit_bundle_context_key_idx ON homepage_kit_bundle (context_key);
CREATE INDEX homepage_kit_item_bundle_id_idx ON homepage_kit_item (homepage_kit_bundle_id);
CREATE INDEX homepage_kit_item_gear_item_id_idx ON homepage_kit_item (gear_item_id);
CREATE INDEX homepage_kit_item_system_id_idx ON homepage_kit_item (system_id);
CREATE INDEX curation_entry_context_key_idx ON curation_entry (context_key);
CREATE INDEX curation_entry_expires_at_idx ON curation_entry (expires_at);
CREATE INDEX curation_entry_gear_item_id_idx ON curation_entry (gear_item_id);
CREATE INDEX media_asset_gear_item_id_idx ON media_asset (gear_item_id);
CREATE INDEX media_asset_review_intel_id_idx ON media_asset (review_intel_id);
CREATE INDEX media_asset_moderation_status_idx ON media_asset (moderation_status);
CREATE INDEX import_job_import_type_idx ON import_job (import_type);
CREATE INDEX import_job_status_idx ON import_job (status);
CREATE INDEX audit_log_event_entity_idx ON audit_log_event (entity_type, entity_id);
CREATE INDEX audit_log_event_actor_idx ON audit_log_event (actor_id);
CREATE INDEX audit_log_event_created_at_idx ON audit_log_event (created_at);

CREATE INDEX gear_item_deleted_at_idx ON gear_item (deleted_at);
CREATE INDEX gear_class_deleted_at_idx ON gear_class (deleted_at);
CREATE INDEX location_deleted_at_idx ON location (deleted_at);
CREATE INDEX system_deleted_at_idx ON system (deleted_at);
CREATE INDEX review_intel_deleted_at_idx ON review_intel (deleted_at);
CREATE INDEX trip_profile_deleted_at_idx ON trip_profile (deleted_at);
CREATE INDEX homepage_kit_bundle_deleted_at_idx ON homepage_kit_bundle (deleted_at);

-- Search indexes
CREATE INDEX gear_item_canonical_search_text_trgm_idx ON gear_item USING GIN (canonical_search_text gin_trgm_ops);

