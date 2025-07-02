# Diseño de Base de Datos - EHR Solutions

## Resumen Ejecutivo

Este documento describe el diseño de la base de datos para EHR Solutions, un sistema de gestión de historiales clínicos electrónicos con capacidades de intercambio seguro entre clínicas utilizando blockchain y estándares HL7 FHIR.

## Principios de Diseño

1. **Normalización**: Estructura normalizada para evitar redundancia
2. **Seguridad**: Campos sensibles identificados para cifrado
3. **Auditoría**: Trazabilidad completa de cambios
4. **Escalabilidad**: Diseño preparado para crecimiento
5. **Integridad Referencial**: Relaciones consistentes entre entidades

## Diagrama Entidad-Relación

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   CLINICS   │──────▶│    USERS    │──────▶│  PATIENTS   │
│             │ 1:N   │             │ 1:N   │             │
└─────────────┘       └─────────────┘       └─────────────┘
                                                    │
                                                    │ 1:N
                                                    ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│EHR_REQUESTS │──────▶│     EHR     │──────▶│EHR_CONTENT  │
│             │ N:1   │             │ 1:1   │             │
└─────────────┘       └─────────────┘       └─────────────┘
       │                      │
       │                      │ 1:N
       │                      ▼
       │              ┌─────────────┐
       │              │EHR_FHIR_DATA│
       │              │             │
       │              └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐       ┌─────────────┐
│REQUEST_LOGS │       │ AUDIT_LOGS  │
│             │       │             │
└─────────────┘       └─────────────┘
```

## Definición de Tablas

### 1. CLINICS (Clínicas)

```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  license VARCHAR(100) NOT NULL UNIQUE,

  -- Dirección
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Peru',

  -- Información de contacto
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  emergency_phone VARCHAR(20),

  -- Especialidades (array de enums)
  specialties TEXT[] NOT NULL DEFAULT '{}',

  -- Configuraciones
  allow_data_sharing BOOLEAN NOT NULL DEFAULT true,
  auto_approve_requests BOOLEAN NOT NULL DEFAULT false,
  encryption_enabled BOOLEAN NOT NULL DEFAULT true,
  audit_log_retention INTEGER NOT NULL DEFAULT 2555, -- días (7 años)

  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Índices
  CONSTRAINT clinics_license_format CHECK (license ~ '^[A-Z0-9]{8,20}$'),
  CONSTRAINT clinics_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para optimización
CREATE INDEX idx_clinics_active ON clinics(is_active);
CREATE INDEX idx_clinics_license ON clinics(license);
CREATE INDEX idx_clinics_specialties ON clinics USING GIN(specialties);
```

### 2. USERS (Usuarios)

```sql
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'CLINIC_ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Información personal
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,

  -- Rol y permisos
  role user_role NOT NULL,

  -- Información profesional
  medical_license VARCHAR(50), -- Solo para doctores/enfermeras
  specialties TEXT[], -- Especialidades del profesional

  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,

  -- Configuraciones de usuario
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'es',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Lima',

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT users_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_medical_license_required CHECK (
    (role IN ('DOCTOR', 'NURSE') AND medical_license IS NOT NULL) OR
    (role NOT IN ('DOCTOR', 'NURSE'))
  )
);

-- Índices
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_active_email ON users(email) WHERE is_active = true;
```

### 3. PATIENTS (Pacientes)

```sql
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Identificación
  national_id VARCHAR(20) NOT NULL, -- DNI, pasaporte, etc.
  national_id_type VARCHAR(20) NOT NULL DEFAULT 'DNI',

  -- Información personal
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender NOT NULL,

  -- Dirección
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Peru',

  -- Contacto
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  preferred_contact_method VARCHAR(10) NOT NULL DEFAULT 'PHONE',

  -- Contacto de emergencia
  emergency_contact_name VARCHAR(200) NOT NULL,
  emergency_contact_relationship VARCHAR(50) NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  emergency_contact_email VARCHAR(255),

  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT patients_age_valid CHECK (date_of_birth <= CURRENT_DATE),
  CONSTRAINT patients_email_format CHECK (
    email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT patients_contact_method CHECK (
    preferred_contact_method IN ('PHONE', 'EMAIL', 'SMS')
  )
);

-- Índices
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_national_id ON patients(national_id);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_active ON patients(is_active);
CREATE UNIQUE INDEX idx_patients_national_id_clinic ON patients(national_id, clinic_id)
  WHERE is_active = true;
```

### 4. EHR (Historiales Clínicos Electrónicos)

```sql
CREATE TYPE ehr_type AS ENUM (
  'CONSULTATION',
  'DIAGNOSIS',
  'TREATMENT',
  'LAB_RESULT',
  'IMAGING',
  'PRESCRIPTION',
  'SURGERY',
  'DISCHARGE_SUMMARY'
);

CREATE TYPE ehr_status AS ENUM ('DRAFT', 'ACTIVE', 'AMENDED', 'CANCELLED');

CREATE TYPE confidentiality_level AS ENUM (
  'LOW',
  'NORMAL',
  'RESTRICTED',
  'VERY_RESTRICTED'
);

CREATE TABLE ehr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Información básica
  type ehr_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Estado y confidencialidad
  status ehr_status NOT NULL DEFAULT 'DRAFT',
  confidentiality_level confidentiality_level NOT NULL DEFAULT 'NORMAL',

  -- Metadatos blockchain/FHIR
  blockchain_hash VARCHAR(64), -- SHA-256 hash
  ipfs_hash VARCHAR(59), -- IPFS hash
  fhir_resource_id VARCHAR(64),

  -- Fechas
  encounter_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT ehr_finalized_when_active CHECK (
    (status = 'ACTIVE' AND finalized_at IS NOT NULL) OR
    (status != 'ACTIVE')
  )
);

-- Índices
CREATE INDEX idx_ehr_patient_id ON ehr(patient_id);
CREATE INDEX idx_ehr_clinic_id ON ehr(clinic_id);
CREATE INDEX idx_ehr_doctor_id ON ehr(doctor_id);
CREATE INDEX idx_ehr_type ON ehr(type);
CREATE INDEX idx_ehr_status ON ehr(status);
CREATE INDEX idx_ehr_encounter_date ON ehr(encounter_date);
CREATE INDEX idx_ehr_blockchain_hash ON ehr(blockchain_hash) WHERE blockchain_hash IS NOT NULL;
```

### 5. EHR_CONTENT (Contenido Estructurado de HCE)

```sql
CREATE TABLE ehr_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ehr_id UUID NOT NULL REFERENCES ehr(id) ON DELETE CASCADE,

  -- Información básica
  chief_complaint TEXT,
  history_of_present_illness TEXT,

  -- Signos vitales (JSONB para flexibilidad)
  vital_signs JSONB,

  -- Examen físico
  physical_examination JSONB,

  -- Diagnósticos
  diagnoses JSONB,

  -- Medicamentos
  medications JSONB,

  -- Procedimientos
  procedures JSONB,

  -- Resultados de laboratorio
  lab_results JSONB,

  -- Notas adicionales
  notes TEXT,

  -- Archivos adjuntos (referencias)
  attachments JSONB,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas en JSONB
CREATE INDEX idx_ehr_content_ehr_id ON ehr_content(ehr_id);
CREATE INDEX idx_ehr_content_vital_signs ON ehr_content USING GIN(vital_signs);
CREATE INDEX idx_ehr_content_diagnoses ON ehr_content USING GIN(diagnoses);
CREATE INDEX idx_ehr_content_medications ON ehr_content USING GIN(medications);
```

### 6. EHR_FHIR_DATA (Datos FHIR)

```sql
CREATE TABLE ehr_fhir_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ehr_id UUID NOT NULL REFERENCES ehr(id) ON DELETE CASCADE,

  -- Recursos FHIR en formato JSON
  patient_resource JSONB NOT NULL,
  encounter_resource JSONB NOT NULL,
  condition_resources JSONB, -- Array de condiciones
  observation_resources JSONB, -- Array de observaciones
  medication_resources JSONB, -- Array de medicamentos
  procedure_resources JSONB, -- Array de procedimientos

  -- Metadatos de validación
  fhir_version VARCHAR(10) NOT NULL DEFAULT 'R4',
  validation_status VARCHAR(20) NOT NULL DEFAULT 'VALID',
  validation_errors JSONB,

  -- Fechas
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_ehr_fhir_data_ehr_id ON ehr_fhir_data(ehr_id);
CREATE INDEX idx_ehr_fhir_data_validation ON ehr_fhir_data(validation_status);
```

### 7. EHR_REQUESTS (Solicitudes de HCE)

```sql
CREATE TYPE urgency_level AS ENUM ('LOW', 'NORMAL', 'HIGH', 'EMERGENCY');

CREATE TYPE request_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ACCESSED',
  'EXPIRED',
  'CANCELLED'
);

CREATE TABLE ehr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clínicas involucradas
  requesting_clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  owner_clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Paciente y solicitante
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Detalles de la solicitud
  reason TEXT NOT NULL,
  urgency_level urgency_level NOT NULL DEFAULT 'NORMAL',
  requested_record_types ehr_type[],

  -- Estado de la solicitud
  status request_status NOT NULL DEFAULT 'PENDING',

  -- Información de aprobación/rechazo
  approved_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Token de acceso
  access_token VARCHAR(128),
  expires_at TIMESTAMP WITH TIME ZONE,
  accessed_at TIMESTAMP WITH TIME ZONE,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT ehr_requests_approval_logic CHECK (
    (status = 'APPROVED' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
    (status = 'REJECTED' AND rejection_reason IS NOT NULL) OR
    (status NOT IN ('APPROVED', 'REJECTED'))
  ),
  CONSTRAINT ehr_requests_different_clinics CHECK (
    requesting_clinic_id != owner_clinic_id
  )
);

-- Índices
CREATE INDEX idx_ehr_requests_requesting_clinic ON ehr_requests(requesting_clinic_id);
CREATE INDEX idx_ehr_requests_owner_clinic ON ehr_requests(owner_clinic_id);
CREATE INDEX idx_ehr_requests_patient ON ehr_requests(patient_id);
CREATE INDEX idx_ehr_requests_status ON ehr_requests(status);
CREATE INDEX idx_ehr_requests_created_at ON ehr_requests(created_at);
CREATE INDEX idx_ehr_requests_expires_at ON ehr_requests(expires_at)
  WHERE expires_at IS NOT NULL;
```

### 8. REQUEST_LOGS (Logs de Solicitudes)

```sql
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES ehr_requests(id) ON DELETE CASCADE,

  -- Cambio registrado
  previous_status request_status,
  new_status request_status NOT NULL,

  -- Usuario que realizó el cambio
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Detalles del cambio
  reason TEXT,
  additional_data JSONB,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_request_logs_request_id ON request_logs(request_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);
```

### 9. AUDIT_LOGS (Logs de Auditoría)

```sql
CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'ACCESS_GRANTED',
  'ACCESS_DENIED'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuario y recurso
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'ehr', 'patient', 'user', etc.
  resource_id UUID,

  -- Acción realizada
  action audit_action NOT NULL,
  description TEXT,

  -- Contexto
  ip_address INET,
  user_agent TEXT,

  -- Datos adicionales
  additional_data JSONB,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Particionamiento por fecha para mejor performance
CREATE INDEX idx_audit_logs_created_at_monthly ON audit_logs(created_at)
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
```

### 10. ATTACHMENTS (Archivos Adjuntos)

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ehr_id UUID NOT NULL REFERENCES ehr(id) ON DELETE CASCADE,

  -- Información del archivo
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,

  -- Almacenamiento
  storage_path VARCHAR(500) NOT NULL,
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'local', -- 'local', 's3', 'ipfs'

  -- Hash para integridad
  file_hash VARCHAR(64) NOT NULL, -- SHA-256

  -- Metadatos
  description TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,

  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Fechas
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT attachments_file_size_positive CHECK (file_size > 0),
  CONSTRAINT attachments_filename_format CHECK (filename ~ '^[a-zA-Z0-9._-]+$')
);

-- Índices
CREATE INDEX idx_attachments_ehr_id ON attachments(ehr_id);
CREATE INDEX idx_attachments_file_hash ON attachments(file_hash);
CREATE INDEX idx_attachments_active ON attachments(is_active);
```

## Vistas y Procedimientos Útiles

### Vista: Pacientes con Conteo de HCE

```sql
CREATE VIEW patient_summary AS
SELECT
  p.*,
  c.name as clinic_name,
  COUNT(e.id) as ehr_count,
  MAX(e.encounter_date) as last_encounter_date
FROM patients p
LEFT JOIN clinics c ON p.clinic_id = c.id
LEFT JOIN ehr e ON p.id = e.patient_id AND e.status = 'ACTIVE'
WHERE p.is_active = true
GROUP BY p.id, c.name;
```

### Vista: Dashboard de Solicitudes

```sql
CREATE VIEW request_dashboard AS
SELECT
  r.*,
  rc.name as requesting_clinic_name,
  oc.name as owner_clinic_name,
  p.first_name || ' ' || p.last_name as patient_name,
  p.national_id as patient_national_id,
  u.first_name || ' ' || u.last_name as requested_by_name
FROM ehr_requests r
JOIN clinics rc ON r.requesting_clinic_id = rc.id
JOIN clinics oc ON r.owner_clinic_id = oc.id
JOIN patients p ON r.patient_id = p.id
JOIN users u ON r.requested_by = u.id;
```

## Consideraciones de Seguridad

### 1. Cifrado de Datos Sensibles

- Contraseñas: bcrypt con salt
- Datos médicos: AES-256 en campos JSONB
- Archivos adjuntos: Cifrado a nivel de archivo

### 2. Índices Parciales

- Solo registros activos para mejor performance
- Particionamiento por fecha en logs de auditoría

### 3. Constraints de Integridad

- Validación de emails y formatos
- Constraints de negocio implementados en DB
- Relaciones foreign key con políticas adecuadas

### 4. Backup y Recuperación

- Backup diario de datos críticos
- Retención de logs según políticas de la clínica
- Réplicas para alta disponibilidad

## Scripts de Migración

El diseño está preparado para migraciones incrementales usando herramientas como Prisma Migrate o Flyway, permitiendo evolución controlada del esquema.
