-- Global AI Adoption Heat Map - Initial Schema
-- Created: 2026-07-07

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
  id NUMBER PRIMARY KEY,
  email VARCHAR2(255) NOT NULL UNIQUE,
  password_hash VARCHAR2(255) NOT NULL,
  github_username VARCHAR2(255),
  linkedin_url VARCHAR2(500),
  opted_in_newsletter NUMBER(1) DEFAULT 0,
  download_count NUMBER DEFAULT 0,
  last_download_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- COUNTRIES & GEOGRAPHIC DATA
-- ============================================================================

CREATE TABLE countries (
  id NUMBER PRIMARY KEY,
  iso3 VARCHAR2(3) NOT NULL UNIQUE,
  name VARCHAR2(100) NOT NULL,
  region VARCHAR2(50) NOT NULL,
  latitude BINARY_DOUBLE,
  longitude BINARY_DOUBLE,
  gdp_2024 NUMBER(20, 2),
  working_age_population NUMBER(12),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE countries_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_countries_iso3 ON countries(iso3);
CREATE INDEX idx_countries_region ON countries(region);

-- ============================================================================
-- COUNTRY AI ADOPTION SNAPSHOTS (Historical Time-Series)
-- ============================================================================

CREATE TABLE country_stats_snapshots (
  id NUMBER PRIMARY KEY,
  country_id NUMBER NOT NULL,
  snapshot_date DATE NOT NULL,
  -- Global usage metrics
  usage_pct BINARY_DOUBLE,
  usage_per_capita_index BINARY_DOUBLE,
  -- Use cases
  use_case_work_pct BINARY_DOUBLE,
  use_case_personal_pct BINARY_DOUBLE,
  use_case_coursework_pct BINARY_DOUBLE,
  -- Collaboration buckets
  collaboration_automation_pct BINARY_DOUBLE,
  collaboration_augmentation_pct BINARY_DOUBLE,
  -- AI characteristics
  ai_autonomy_mean BINARY_DOUBLE,
  multitasking_pct BINARY_DOUBLE,
  top_topic VARCHAR2(200),
  top_topic_pct BINARY_DOUBLE,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_stats_country FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE SEQUENCE country_stats_snapshots_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_stats_country_date ON country_stats_snapshots(country_id, snapshot_date);
CREATE INDEX idx_stats_snapshot_date ON country_stats_snapshots(snapshot_date);

-- ============================================================================
-- REGIONAL AGGREGATIONS (Cached for performance)
-- ============================================================================

CREATE TABLE regional_aggregations (
  id NUMBER PRIMARY KEY,
  region VARCHAR2(50) NOT NULL,
  snapshot_date DATE NOT NULL,
  total_usage_pct BINARY_DOUBLE,
  avg_per_capita_index BINARY_DOUBLE,
  country_count NUMBER,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT uk_region_date UNIQUE (region, snapshot_date)
);

CREATE SEQUENCE regional_aggregations_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_region_agg_date ON regional_aggregations(snapshot_date);

-- ============================================================================
-- SECTOR USAGE TRACKING
-- ============================================================================

CREATE TABLE sector_usage (
  id NUMBER PRIMARY KEY,
  country_id NUMBER NOT NULL,
  sector VARCHAR2(100) NOT NULL,
  usage_percentage BINARY_DOUBLE,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_sector_country FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE SEQUENCE sector_usage_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_sector_country_date ON sector_usage(country_id, snapshot_date);

-- ============================================================================
-- STOCK PRICE HISTORY (Company valuations)
-- ============================================================================

CREATE TABLE company_stocks (
  id NUMBER PRIMARY KEY,
  symbol VARCHAR2(10) NOT NULL UNIQUE,
  name VARCHAR2(100) NOT NULL,
  sector VARCHAR2(50),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE company_stocks_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE stock_price_history (
  id NUMBER PRIMARY KEY,
  company_id NUMBER NOT NULL,
  price BINARY_DOUBLE NOT NULL,
  market_cap NUMBER(20, 2),
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_stock_company FOREIGN KEY (company_id) REFERENCES company_stocks(id)
);

CREATE SEQUENCE stock_price_history_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_stock_date ON stock_price_history(date_recorded);
CREATE INDEX idx_stock_company_date ON stock_price_history(company_id, date_recorded);

-- ============================================================================
-- HARDWARE SALES INDEX
-- ============================================================================

CREATE TABLE hardware_sales_index (
  id NUMBER PRIMARY KEY,
  date_recorded DATE NOT NULL,
  gpu_sales_units NUMBER(12),
  cpu_sales_units NUMBER(12),
  ram_gb_sold NUMBER(16, 2),
  price_index BINARY_DOUBLE,
  source VARCHAR2(100),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE hardware_sales_index_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_hardware_date ON hardware_sales_index(date_recorded);

-- ============================================================================
-- DOWNLOAD REQUESTS (Audit trail)
-- ============================================================================

CREATE TABLE download_requests (
  id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL,
  file_format VARCHAR2(20),
  data_version VARCHAR2(50),
  start_date DATE,
  end_date DATE,
  ip_address VARCHAR2(45),
  user_agent VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_download_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE SEQUENCE download_requests_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_downloads_user_date ON download_requests(user_id, created_at);
CREATE INDEX idx_downloads_date ON download_requests(created_at);

-- ============================================================================
-- DATA VERSION CONTROL (Immutable dataset snapshots)
-- ============================================================================

CREATE TABLE data_versions (
  id NUMBER PRIMARY KEY,
  version VARCHAR2(50) NOT NULL UNIQUE,
  source VARCHAR2(100),
  release_date DATE NOT NULL,
  countries_count NUMBER,
  data_point_count NUMBER,
  checksum VARCHAR2(64),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE data_versions_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_versions_release_date ON data_versions(release_date);

-- ============================================================================
-- API ACTIVITY LOG (for monitoring & analytics)
-- ============================================================================

CREATE TABLE api_activity_log (
  id NUMBER PRIMARY KEY,
  endpoint VARCHAR2(200),
  method VARCHAR2(10),
  user_id NUMBER,
  response_code NUMBER,
  response_time_ms NUMBER,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE api_activity_log_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX idx_api_log_user ON api_activity_log(user_id);
CREATE INDEX idx_api_log_date ON api_activity_log(created_at);

-- ============================================================================
-- COMMIT
-- ============================================================================

COMMIT;
