# Requisitos Funcionales - EHR Solutions

## 1. Gestión de Usuarios y Autenticación

### RF-001: Registro de Usuario

- **Descripción**: El sistema debe permitir el registro de nuevos usuarios
- **Actores**: Administrador de clínica
- **Precondiciones**: El usuario debe tener credenciales válidas de administrador
- **Flujo**:
  1. El administrador accede al formulario de registro
  2. Ingresa datos del nuevo usuario (nombre, email, rol, clínica)
  3. El sistema valida los datos
  4. Se envía email de confirmación al nuevo usuario
  5. El usuario establece su contraseña
- **Postcondiciones**: Usuario creado y activo en el sistema

### RF-002: Autenticación de Usuario

- **Descripción**: Los usuarios deben poder iniciar sesión en el sistema
- **Actores**: Todos los usuarios
- **Precondiciones**: Usuario registrado y activo
- **Flujo**:
  1. Usuario ingresa email y contraseña
  2. Sistema valida credenciales
  3. Sistema genera JWT token
  4. Usuario accede al dashboard según su rol
- **Postcondiciones**: Usuario autenticado con sesión activa

### RF-003: Gestión de Roles

- **Descripción**: El sistema debe manejar diferentes roles con permisos específicos
- **Roles**:
  - **Super Admin**: Gestión completa del sistema
  - **Clinic Admin**: Gestión de su clínica y usuarios
  - **Doctor**: Acceso a pacientes y HCE de su clínica
  - **Nurse**: Acceso limitado a pacientes y HCE
  - **Receptionist**: Gestión de pacientes, sin acceso a HCE

## 2. Gestión de Clínicas

### RF-004: Registro de Clínica

- **Descripción**: El sistema debe permitir registrar nuevas clínicas
- **Actores**: Super Admin
- **Precondiciones**: Usuario con rol Super Admin
- **Flujo**:
  1. Super Admin accede al formulario de registro de clínica
  2. Ingresa información de la clínica (nombre, dirección, especialidades, licencia)
  3. Sistema valida los datos
  4. Se crea la clínica en estado activo
- **Postcondiciones**: Clínica registrada y disponible para asignar usuarios

### RF-005: Gestión de Perfil de Clínica

- **Descripción**: Los administradores pueden gestionar la información de su clínica
- **Actores**: Clinic Admin
- **Funcionalidades**:
  - Actualizar información básica
  - Gestionar especialidades médicas
  - Configurar preferencias de compartición de datos
  - Gestionar contactos de emergencia

## 3. Gestión de Pacientes

### RF-006: Registro de Paciente

- **Descripción**: El sistema debe permitir registrar nuevos pacientes
- **Actores**: Clinic Admin, Doctor, Nurse, Receptionist
- **Precondiciones**: Usuario autenticado de la clínica
- **Flujo**:
  1. Usuario accede al formulario de registro de paciente
  2. Ingresa datos demográficos y de contacto
  3. Sistema valida unicidad del documento de identidad
  4. Se crea el paciente asociado a la clínica
- **Postcondiciones**: Paciente registrado y disponible para atención

### RF-007: Búsqueda de Pacientes

- **Descripción**: Los usuarios deben poder buscar pacientes existentes
- **Actores**: Clinic Admin, Doctor, Nurse, Receptionist
- **Criterios de búsqueda**:
  - Número de documento
  - Nombre completo
  - Fecha de nacimiento
  - Número de teléfono

### RF-008: Actualización de Datos de Paciente

- **Descripción**: El sistema debe permitir actualizar información del paciente
- **Actores**: Clinic Admin, Doctor, Nurse, Receptionist
- **Restricciones**: Solo se puede actualizar pacientes de la misma clínica

## 4. Gestión de Historiales Clínicos Electrónicos (HCE)

### RF-009: Creación de HCE

- **Descripción**: Los médicos deben poder crear nuevos historiales clínicos
- **Actores**: Doctor, Nurse (limitado)
- **Precondiciones**: Paciente registrado, usuario autenticado
- **Flujo**:
  1. Médico selecciona paciente
  2. Elige tipo de registro (consulta, diagnóstico, etc.)
  3. Completa formulario estructurado con:
     - Motivo de consulta
     - Signos vitales
     - Examen físico
     - Diagnósticos
     - Tratamientos
     - Medicamentos
  4. Sistema valida completitud de datos críticos
  5. HCE se guarda en formato estructurado
- **Postcondiciones**: HCE creado y disponible para transformación FHIR

### RF-010: Visualización de HCE

- **Descripción**: Los usuarios autorizados pueden visualizar historiales clínicos
- **Actores**: Doctor, Nurse, Clinic Admin
- **Restricciones**:
  - Solo HCE de pacientes de la misma clínica
  - Respeto a niveles de confidencialidad
  - Registro de auditoría de accesos

### RF-011: Edición de HCE

- **Descripción**: Los médicos pueden editar HCE en estado borrador
- **Actores**: Doctor (creador del HCE)
- **Restricciones**:
  - Solo HCE en estado "DRAFT"
  - Una vez finalizado, solo se permiten enmiendas
  - Trazabilidad completa de cambios

## 5. Transformación HL7 FHIR

### RF-012: Conversión Automática a FHIR

- **Descripción**: El sistema debe transformar HCE a formato HL7 FHIR
- **Trigger**: Finalización de HCE
- **Proceso**:
  1. Sistema toma HCE en formato estructurado
  2. Aplica mapeo a recursos FHIR relevantes:
     - Patient
     - Encounter
     - Condition (diagnósticos)
     - Observation (signos vitales, resultados)
     - MedicationRequest
     - Procedure
  3. Valida recursos FHIR generados
  4. Almacena versión FHIR vinculada al HCE original
- **Postcondiciones**: HCE disponible en formato FHIR válido

### RF-013: Validación de Recursos FHIR

- **Descripción**: Todos los recursos FHIR deben ser validados antes del almacenamiento
- **Validaciones**:
  - Sintaxis JSON válida
  - Cumplimiento con perfiles FHIR R4
  - Presencia de elementos obligatorios
  - Tipos de datos correctos

## 6. Solicitud de HCE entre Clínicas

### RF-014: Crear Solicitud de HCE

- **Descripción**: Las clínicas pueden solicitar HCE de pacientes atendidos en otras clínicas
- **Actores**: Doctor, Clinic Admin
- **Precondiciones**:
  - Conocimiento del paciente (nombre, documento)
  - Justificación médica válida
- **Flujo**:
  1. Usuario busca paciente por documento o nombre
  2. Sistema identifica clínica propietaria del HCE
  3. Usuario completa solicitud con:
     - Motivo médico
     - Nivel de urgencia
     - Tipos de registros específicos (opcional)
     - Tiempo de acceso solicitado
  4. Sistema registra solicitud
  5. Se notifica a la clínica propietaria
- **Postcondiciones**: Solicitud registrada y pendiente de aprobación

### RF-015: Gestión de Solicitudes Recibidas

- **Descripción**: Las clínicas deben poder gestionar solicitudes de HCE recibidas
- **Actores**: Clinic Admin, Doctor (del paciente)
- **Funcionalidades**:
  - Ver lista de solicitudes pendientes
  - Revisar detalles de la solicitud
  - Aprobar o rechazar con justificación
  - Establecer condiciones de acceso (tiempo, scope)

### RF-016: Notificaciones de Solicitudes

- **Descripción**: El sistema debe notificar sobre solicitudes y cambios de estado
- **Tipos de notificación**:
  - Email y notificación in-app
  - Nueva solicitud recibida
  - Solicitud aprobada/rechazada
  - Acceso realizado a HCE
  - Solicitud próxima a expirar

## 7. Intercambio Seguro (Handshake)

### RF-017: Mecanismo de Handshake

- **Descripción**: Implementar intercambio seguro de claves para acceso a HCE
- **Trigger**: Solicitud aprobada
- **Proceso**:
  1. Sistema genera token de acceso único
  2. Token se almacena cifrado en blockchain
  3. Se genera clave de descifrado temporal
  4. Clave se envía a clínica solicitante por canal seguro
  5. Sistema registra intercambio en auditoría
- **Postcondiciones**: Acceso seguro establecido con trazabilidad completa

### RF-018: Acceso a HCE Compartido

- **Descripción**: Las clínicas autorizadas pueden acceder a HCE compartidos
- **Actores**: Doctor, Clinic Admin (de clínica solicitante)
- **Precondiciones**:
  - Solicitud aprobada
  - Token de acceso válido
  - Dentro del período autorizado
- **Flujo**:
  1. Usuario accede a sección de HCE compartidos
  2. Sistema verifica autorización
  3. Descifra HCE usando token de acceso
  4. Presenta HCE en formato FHIR estandarizado
  5. Registra acceso en auditoría
- **Postcondiciones**: HCE consultado y acceso registrado

## 8. Almacenamiento en Blockchain

### RF-019: Registro de HCE en Blockchain

- **Descripción**: Los metadatos de HCE deben registrarse en blockchain
- **Trigger**: Finalización de HCE y conversión FHIR
- **Datos almacenados**:
  - Hash del HCE cifrado
  - ID del paciente (hasheado)
  - ID de la clínica propietaria
  - Timestamp de creación
  - Nivel de confidencialidad
- **Postcondiciones**: Integridad y inmutabilidad garantizada

### RF-020: Registro de Transacciones de Acceso

- **Descripción**: Todas las transacciones de acceso deben registrarse en blockchain
- **Eventos registrados**:
  - Solicitudes de acceso
  - Aprobaciones/rechazos
  - Accesos realizados
  - Expiración de permisos

## 9. Auditoría y Trazabilidad

### RF-021: Log de Auditoría

- **Descripción**: El sistema debe mantener un registro completo de actividades
- **Eventos auditados**:
  - Accesos a HCE
  - Modificaciones de datos
  - Solicitudes de intercambio
  - Cambios de permisos
  - Intentos de acceso no autorizado

### RF-022: Reportes de Actividad

- **Descripción**: Los administradores deben poder generar reportes de actividad
- **Tipos de reporte**:
  - Accesos por usuario/período
  - Solicitudes de intercambio
  - Actividad por paciente
  - Métricas de uso del sistema

## 10. Configuración y Administración

### RF-023: Configuración de Clínica

- **Descripción**: Cada clínica debe poder configurar sus preferencias
- **Configuraciones disponibles**:
  - Política de compartición automática
  - Tiempo por defecto de acceso
  - Tipos de HCE compartibles
  - Notificaciones activas

### RF-024: Gestión de Permisos Granulares

- **Descripción**: El sistema debe permitir permisos específicos por tipo de dato
- **Niveles de granularidad**:
  - Por tipo de HCE
  - Por nivel de confidencialidad
  - Por especialidad médica
  - Por usuario específico
