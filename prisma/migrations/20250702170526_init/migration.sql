-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EhrType" AS ENUM ('CONSULTATION', 'DIAGNOSIS', 'TREATMENT', 'LAB_RESULT', 'IMAGING', 'PRESCRIPTION', 'SURGERY', 'DISCHARGE_SUMMARY');

-- CreateEnum
CREATE TYPE "EhrStatus" AS ENUM ('DRAFT', 'ACTIVE', 'AMENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConfidentialityLevel" AS ENUM ('LOW', 'NORMAL', 'RESTRICTED', 'VERY_RESTRICTED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACCESSED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS_GRANTED', 'ACCESS_DENIED');

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "license" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Peru',
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "emergency_phone" TEXT,
    "specialties" TEXT[],
    "allow_data_sharing" BOOLEAN NOT NULL DEFAULT true,
    "auto_approve_requests" BOOLEAN NOT NULL DEFAULT false,
    "encryption_enabled" BOOLEAN NOT NULL DEFAULT true,
    "audit_log_retention" INTEGER NOT NULL DEFAULT 2555,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "medical_license" TEXT,
    "specialties" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "preferred_language" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'America/Lima',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "national_id_type" TEXT NOT NULL DEFAULT 'DNI',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Peru',
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "preferred_contact_method" TEXT NOT NULL DEFAULT 'PHONE',
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_relationship" TEXT NOT NULL,
    "emergency_contact_phone" TEXT NOT NULL,
    "emergency_contact_email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehr" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "type" "EhrType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "EhrStatus" NOT NULL DEFAULT 'DRAFT',
    "confidentiality_level" "ConfidentialityLevel" NOT NULL DEFAULT 'NORMAL',
    "blockchain_hash" TEXT,
    "ipfs_hash" TEXT,
    "fhir_resource_id" TEXT,
    "encounter_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "finalized_at" TIMESTAMP(3),

    CONSTRAINT "ehr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehr_content" (
    "id" TEXT NOT NULL,
    "ehr_id" TEXT NOT NULL,
    "chief_complaint" TEXT,
    "history_of_present_illness" TEXT,
    "vital_signs" JSONB,
    "physical_examination" JSONB,
    "diagnoses" JSONB,
    "medications" JSONB,
    "procedures" JSONB,
    "lab_results" JSONB,
    "notes" TEXT,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ehr_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehr_fhir_data" (
    "id" TEXT NOT NULL,
    "ehr_id" TEXT NOT NULL,
    "patient_resource" JSONB NOT NULL,
    "encounter_resource" JSONB NOT NULL,
    "condition_resources" JSONB,
    "observation_resources" JSONB,
    "medication_resources" JSONB,
    "procedure_resources" JSONB,
    "fhir_version" TEXT NOT NULL DEFAULT 'R4',
    "validation_status" TEXT NOT NULL DEFAULT 'VALID',
    "validation_errors" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ehr_fhir_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehr_requests" (
    "id" TEXT NOT NULL,
    "requesting_clinic_id" TEXT NOT NULL,
    "owner_clinic_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "urgency_level" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "requested_record_types" "EhrType"[],
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "access_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "accessed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ehr_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "previous_status" "RequestStatus",
    "new_status" "RequestStatus" NOT NULL,
    "changed_by" TEXT NOT NULL,
    "reason" TEXT,
    "additional_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "description" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "additional_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "ehr_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "storage_provider" TEXT NOT NULL DEFAULT 'local',
    "file_hash" TEXT NOT NULL,
    "description" TEXT,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_license_key" ON "clinics"("license");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_clinic_id_key" ON "patients"("national_id", "clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "ehr_content_ehr_id_key" ON "ehr_content"("ehr_id");

-- CreateIndex
CREATE UNIQUE INDEX "ehr_fhir_data_ehr_id_key" ON "ehr_fhir_data"("ehr_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr" ADD CONSTRAINT "ehr_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr" ADD CONSTRAINT "ehr_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr" ADD CONSTRAINT "ehr_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_content" ADD CONSTRAINT "ehr_content_ehr_id_fkey" FOREIGN KEY ("ehr_id") REFERENCES "ehr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_fhir_data" ADD CONSTRAINT "ehr_fhir_data_ehr_id_fkey" FOREIGN KEY ("ehr_id") REFERENCES "ehr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_requests" ADD CONSTRAINT "ehr_requests_requesting_clinic_id_fkey" FOREIGN KEY ("requesting_clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_requests" ADD CONSTRAINT "ehr_requests_owner_clinic_id_fkey" FOREIGN KEY ("owner_clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_requests" ADD CONSTRAINT "ehr_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_requests" ADD CONSTRAINT "ehr_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehr_requests" ADD CONSTRAINT "ehr_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "ehr_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_ehr_id_fkey" FOREIGN KEY ("ehr_id") REFERENCES "ehr"("id") ON DELETE CASCADE ON UPDATE CASCADE;
