// ============================================================================
// TIPOS DE USUARIO Y AUTENTICACIÓN
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clinicId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ============================================================================
// TIPOS DE CLÍNICA
// ============================================================================

export interface Clinic {
  id: string;
  name: string;
  description?: string;
  address: Address;
  contactInfo: ContactInfo;
  specialties: MedicalSpecialty[];
  license: string;
  isActive: boolean;
  settings: ClinicSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  emergencyPhone?: string;
}

export enum MedicalSpecialty {
  GENERAL_MEDICINE = 'GENERAL_MEDICINE',
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  PEDIATRICS = 'PEDIATRICS',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  GYNECOLOGY = 'GYNECOLOGY',
  PSYCHIATRY = 'PSYCHIATRY',
  RADIOLOGY = 'RADIOLOGY',
  EMERGENCY = 'EMERGENCY',
  // Agregar más según necesidad
}

export interface ClinicSettings {
  allowDataSharing: boolean;
  autoApproveRequests: boolean;
  encryptionEnabled: boolean;
  auditLogRetention: number; // días
}

// ============================================================================
// TIPOS DE PACIENTE
// ============================================================================

export interface Patient {
  id: string;
  nationalId: string; // DNI, SSN, etc.
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  address: Address;
  contactInfo: PatientContactInfo;
  emergencyContact: EmergencyContact;
  clinicId: string; // Clínica que registró al paciente
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface PatientContactInfo {
  phone: string;
  email?: string;
  preferredContactMethod: 'PHONE' | 'EMAIL' | 'SMS';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// ============================================================================
// TIPOS DE HISTORIAL CLÍNICO ELECTRÓNICO (HCE)
// ============================================================================

export interface ElectronicHealthRecord {
  id: string;
  patientId: string;
  clinicId: string;
  doctorId: string;
  type: EHRType;
  title: string;
  description?: string;
  content: EHRContent;
  status: EHRStatus;
  confidentialityLevel: ConfidentialityLevel;
  // Metadatos para blockchain
  blockchainHash?: string;
  ipfsHash?: string;
  fhirResourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EHRType {
  CONSULTATION = 'CONSULTATION',
  DIAGNOSIS = 'DIAGNOSIS',
  TREATMENT = 'TREATMENT',
  LAB_RESULT = 'LAB_RESULT',
  IMAGING = 'IMAGING',
  PRESCRIPTION = 'PRESCRIPTION',
  SURGERY = 'SURGERY',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
}

export enum EHRStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  AMENDED = 'AMENDED',
  CANCELLED = 'CANCELLED',
}

export enum ConfidentialityLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  RESTRICTED = 'RESTRICTED',
  VERY_RESTRICTED = 'VERY_RESTRICTED',
}

// Contenido estructurado del HCE (formato "impuesto por la app")
export interface EHRContent {
  // Información básica
  date: Date;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;

  // Signos vitales
  vitalSigns?: VitalSigns;

  // Examen físico
  physicalExamination?: PhysicalExamination;

  // Diagnósticos
  diagnoses?: Diagnosis[];

  // Medicamentos
  medications?: Medication[];

  // Procedimientos
  procedures?: Procedure[];

  // Resultados de laboratorio
  labResults?: LabResult[];

  // Notas adicionales
  notes?: string;

  // Archivos adjuntos
  attachments?: Attachment[];
}

export interface VitalSigns {
  temperature?: number; // Celsius
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number; // BPM
  respiratoryRate?: number; // RPM
  oxygenSaturation?: number; // %
  weight?: number; // kg
  height?: number; // cm
}

export interface PhysicalExamination {
  general?: string;
  cardiovascular?: string;
  respiratory?: string;
  neurological?: string;
  musculoskeletal?: string;
  skin?: string;
  other?: string;
}

export interface Diagnosis {
  code?: string; // ICD-10
  description: string;
  type: 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL';
  severity?: 'MILD' | 'MODERATE' | 'SEVERE';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: 'ORAL' | 'IV' | 'IM' | 'TOPICAL' | 'OTHER';
  instructions?: string;
}

export interface Procedure {
  name: string;
  code?: string; // CPT
  description?: string;
  date: Date;
  outcome?: string;
}

export interface LabResult {
  test: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  date: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  description?: string;
}

// ============================================================================
// TIPOS DE SOLICITUD DE HCE
// ============================================================================

export interface EHRRequest {
  id: string;
  requestingClinicId: string;
  ownerClinicId: string;
  patientId: string;
  requestedBy: string; // User ID
  reason: string;
  urgencyLevel: UrgencyLevel;
  status: RequestStatus;
  requestedRecordTypes?: EHRType[];
  // Metadatos de aprobación
  approvedBy?: string; // User ID
  approvedAt?: Date;
  rejectionReason?: string;
  // Metadatos de acceso
  accessToken?: string;
  expiresAt?: Date;
  accessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UrgencyLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACCESSED = 'ACCESSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// TIPOS DE RESPUESTA DE API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// TIPOS DE FORMULARIOS
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clinicId?: string;
}

export interface PatientForm {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
}

export interface EHRForm {
  patientId: string;
  type: EHRType;
  title: string;
  description?: string;
  content: Partial<EHRContent>;
  confidentialityLevel: ConfidentialityLevel;
}
