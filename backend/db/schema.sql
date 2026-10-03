-- PulseFit — esquema de base de datos (PostgreSQL)
DROP TABLE IF EXISTS class_enrollments, pt_sessions, progress, checkins, payments,
  classes, equipment, leads, members, trainers, plans, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  plan_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  perks TEXT
);

CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  join_date DATE,
  -- manual_status: solo lo pone el staff a mano ('Activo' o 'Congelado').
  -- El estado real que ve el usuario (Activo/Vencido/Cancelado) se calcula
  -- automáticamente a partir de la fecha del último pago + duración del plan,
  -- salvo que manual_status = 'Congelado' (eso sí es una decisión manual).
  manual_status TEXT NOT NULL DEFAULT 'Activo' CHECK (manual_status IN ('Activo','Congelado')),
  frozen_since DATE
);

CREATE TABLE trainers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  certification TEXT,
  status TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo','En licencia'))
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  schedule TEXT,
  capacity INTEGER NOT NULL DEFAULT 0
);

-- Tabla puente: aquí es donde antes se inventaba el número de "inscritos"
-- a mano; ahora se cuenta de verdad a partir de esta tabla.
CREATE TABLE class_enrollments (
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, member_id)
);

CREATE TABLE checkins (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration TEXT
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pagado','Pendiente','Vencido'))
);

CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  equipment_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'Bueno' CHECK (condition IN ('Bueno','Necesita reparación','Fuera de servicio')),
  last_serviced DATE,
  observaciones TEXT
);

CREATE TABLE pt_sessions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  focus_area TEXT,
  status TEXT NOT NULL DEFAULT 'Programada' CHECK (status IN ('Programada','Completada','Cancelada'))
);

CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(6,2),
  body_fat_pct NUMERIC(4,1),
  notes TEXT
);

CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  source TEXT,
  interested_plan TEXT,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'Nuevo' CHECK (status IN ('Nuevo','Contactado','Prueba agendada','Convertido','Perdido'))
);

CREATE INDEX idx_members_plan ON members(plan_id);
CREATE INDEX idx_checkins_member ON checkins(member_id);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_ptsessions_member ON pt_sessions(member_id);
CREATE INDEX idx_progress_member ON progress(member_id);
