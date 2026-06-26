CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(150) NOT NULL,
  name_np VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description_en TEXT,
  description_np TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_departments_slug ON departments(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_departments_deleted_at ON departments(deleted_at);

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name_en VARCHAR(150) NOT NULL,
  name_np VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description_en TEXT,
  description_np TEXT,
  icon VARCHAR(100),
  category VARCHAR(50),
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_services_department_id ON services(department_id);
CREATE INDEX idx_services_slug ON services(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON services(category);

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Unified staff/doctor directory. staff_type distinguishes doctor / nurse / admin / support / technical.
-- Doctor-specific fields are nullable and simply unused for non-doctor rows.
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  staff_type VARCHAR(30) NOT NULL DEFAULT 'support'
    CHECK (staff_type IN ('doctor', 'nursing', 'administrative', 'technical', 'support')),
  designation_en VARCHAR(150) NOT NULL,
  designation_np VARCHAR(150) NOT NULL,
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  biography_en TEXT,
  biography_np TEXT,
  photo_url VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(30),
  social_links JSONB DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_staff_department_id ON staff(department_id);
CREATE INDEX idx_staff_type ON staff(staff_type);
CREATE INDEX idx_staff_deleted_at ON staff(deleted_at);

CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Weekly availability, mainly relevant for doctor_type staff but usable by anyone
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_schedules_staff_id ON staff_schedules(staff_id);
