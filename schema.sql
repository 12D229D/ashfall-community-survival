-- ============================================================================
-- Ashfall Haven — Esquema SQLite Declarativo
-- Persistencia de Supervivientes, Refugio, Crónicas y Libro de Cuentas
-- Compatible con SQLite 3.45+ y SQLite WASM / WebSQL / LocalStorage Engine
-- ============================================================================

-- Tabla de Supervivientes de la Comunidad
CREATE TABLE IF NOT EXISTS survivors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    trait_primary TEXT NOT NULL,
    trait_secondary TEXT,
    health INTEGER NOT NULL DEFAULT 100,
    hunger INTEGER NOT NULL DEFAULT 20,
    fatigue INTEGER NOT NULL DEFAULT 15,
    respiratory_stress INTEGER NOT NULL DEFAULT 10,
    morale INTEGER NOT NULL DEFAULT 75,
    is_alive INTEGER NOT NULL DEFAULT 1,
    assigned_job TEXT DEFAULT 'descanso',
    current_location TEXT DEFAULT 'refugio',
    death_cause TEXT,
    death_day INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Estado General y Recursos del Refugio
CREATE TABLE IF NOT EXISTS shelter_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    day INTEGER NOT NULL DEFAULT 1,
    hour INTEGER NOT NULL DEFAULT 6,
    active_survivor_id TEXT,
    food_rations REAL NOT NULL DEFAULT 40.0,
    water_liters REAL NOT NULL DEFAULT 55.0,
    medical_supplies INTEGER NOT NULL DEFAULT 12,
    air_filters INTEGER NOT NULL DEFAULT 6,
    fuel_units REAL NOT NULL DEFAULT 25.0,
    materials INTEGER NOT NULL DEFAULT 30,
    filter_wear_percent REAL NOT NULL DEFAULT 15.0,
    purifier_level INTEGER NOT NULL DEFAULT 1,
    greenhouse_level INTEGER NOT NULL DEFAULT 1,
    clinic_level INTEGER NOT NULL DEFAULT 1,
    workshop_level INTEGER NOT NULL DEFAULT 1,
    current_ash_phase TEXT NOT NULL DEFAULT 'leve',
    volcanic_seismic_risk INTEGER NOT NULL DEFAULT 10,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (active_survivor_id) REFERENCES survivors(id)
);

-- Libro de Cuentas: Decisiones, Dilemas Morales y Confianza de Facciones
CREATE TABLE IF NOT EXISTS ledger_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    chosen_option TEXT NOT NULL,
    impact_civilians INTEGER NOT NULL,
    impact_technicians INTEGER NOT NULL,
    impact_scouts INTEGER NOT NULL,
    resources_delta TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Registro Histórico de Expediciones
CREATE TABLE IF NOT EXISTS expeditions_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day INTEGER NOT NULL,
    survivor_id TEXT NOT NULL,
    sector_id TEXT NOT NULL,
    sector_name TEXT NOT NULL,
    route_risk TEXT NOT NULL,
    loot_summary TEXT,
    injury_level INTEGER DEFAULT 0,
    incident_log TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survivor_id) REFERENCES survivors(id)
);

-- Crónicas y Memorial de Caídos (Muerte Permanente)
CREATE TABLE IF NOT EXISTS chronicles_memorial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'death', 'heroic_action', 'collapse', 'discovery'
    survivor_name TEXT,
    chronicle_text TEXT NOT NULL,
    legacy_note TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_survivors_alive ON survivors(is_alive);
CREATE INDEX IF NOT EXISTS idx_ledger_day ON ledger_decisions(day);
CREATE INDEX IF NOT EXISTS idx_chronicles_day ON chronicles_memorial(day);
