/* Esquemas de campos para los formularios (FormModal). Los datos reales
   ahora viven en la base de datos — este archivo solo describe cómo se
   ven los formularios, no contiene datos de ejemplo. */

export const memberFields = [
  { name: 'name', label: 'Nombre completo', required: true, placeholder: 'ej. Derek Holt' },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true, placeholder: 'miembro@ejemplo.com' },
  { name: 'phone', label: 'Teléfono', placeholder: '+1 555-0100' },
  { name: 'plan', label: 'Plan de membresía', placeholder: 'ej. Élite Anual' },
  { name: 'joinDate', label: 'Fecha de ingreso', type: 'date' },
  {
    name: 'status', label: 'Estado', type: 'select', required: true,
    options: ['Activo', 'Congelado'].map(s => ({ value: s, label: s })),
    hint: '"Vencido" y "Cancelado" los calcula el sistema solo según la fecha de pago — aquí solo decides si está Activo o lo Congelas a mano.',
  },
]

export const planFields = [
  { name: 'planName', label: 'Nombre del plan', required: true, placeholder: 'ej. Básico Mensual' },
  { name: 'duration', label: 'Duración', type: 'select', required: true, options: ['Mensual', 'Trimestral', 'Anual'].map(d => ({ value: d, label: d })) },
  { name: 'price', label: 'Precio ($)', type: 'number', required: true },
  { name: 'perks', label: 'Beneficios', type: 'textarea', placeholder: 'Qué incluye el plan…' },
]

export const checkinFields = [
  { name: 'memberName', label: 'Nombre del miembro', required: true, placeholder: 'ej. Derek Holt', hint: 'Debe ser un miembro ya registrado' },
  { name: 'date', label: 'Fecha', type: 'date', required: true },
  { name: 'time', label: 'Hora de entrada', required: true, placeholder: 'ej. 6:15 AM' },
  { name: 'duration', label: 'Duración de la sesión', placeholder: 'ej. 75 min' },
]

export const classFields = [
  { name: 'className', label: 'Nombre de la clase', required: true, placeholder: 'ej. Bootcamp HIIT' },
  { name: 'trainer', label: 'Entrenador', required: true, placeholder: 'ej. Entrenador Riley James', hint: 'Debe ser un entrenador ya registrado' },
  { name: 'schedule', label: 'Horario', placeholder: 'ej. Lun/Mié/Vie, 6:00 AM' },
  { name: 'capacity', label: 'Cupo', type: 'number', required: true },
]

export const paymentFields = [
  { name: 'memberName', label: 'Nombre del miembro', required: true, placeholder: 'ej. Derek Holt', hint: 'Debe ser un miembro ya registrado' },
  { name: 'plan', label: 'Plan', placeholder: 'ej. Élite Anual', hint: 'Debe ser un plan ya registrado' },
  { name: 'amount', label: 'Monto ($)', type: 'number', required: true },
  { name: 'date', label: 'Fecha', type: 'date', required: true },
  { name: 'status', label: 'Estado', type: 'select', required: true, options: ['Pagado', 'Pendiente', 'Vencido'].map(s => ({ value: s, label: s })) },
]

export const equipmentFields = [
  { name: 'equipmentName', label: 'Equipo', required: true, placeholder: 'ej. Caminadora' },
  { name: 'category', label: 'Categoría', type: 'select', options: ['Cardio', 'Fuerza', 'Pesas Libres', 'Funcional', 'Otro'].map(c => ({ value: c, label: c })) },
  { name: 'quantity', label: 'Cantidad', type: 'number', required: true },
  { name: 'condition', label: 'Condición', type: 'select', required: true, options: ['Bueno', 'Necesita reparación', 'Fuera de servicio'].map(c => ({ value: c, label: c })) },
  { name: 'lastServiced', label: 'Último mantenimiento', type: 'date' },
  { name: 'observaciones', label: 'Observaciones', type: 'textarea', placeholder: 'Notas de mantenimiento, repuestos pendientes, etc.' },
]

export const trainerFields = [
  { name: 'name', label: 'Nombre completo', required: true, placeholder: 'ej. Entrenador Riley James' },
  { name: 'specialty', label: 'Especialidad', required: true, placeholder: 'ej. HIIT y Acondicionamiento' },
  { name: 'phone', label: 'Teléfono', placeholder: '+1 555-0100' },
  { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'entrenador@pulsefit.io' },
  { name: 'certification', label: 'Certificación', placeholder: 'ej. NASM-CPT' },
  { name: 'status', label: 'Estado', type: 'select', required: true, options: ['Activo', 'En licencia'].map(s => ({ value: s, label: s })) },
]

export const ptSessionFields = [
  { name: 'memberName', label: 'Nombre del miembro', required: true, placeholder: 'ej. Derek Holt', hint: 'Debe ser un miembro ya registrado' },
  { name: 'trainerName', label: 'Entrenador', required: true, placeholder: 'ej. Entrenador Riley James', hint: 'Debe ser un entrenador ya registrado' },
  { name: 'date', label: 'Fecha', type: 'date', required: true },
  { name: 'time', label: 'Hora', required: true, placeholder: 'ej. 7:00 AM' },
  { name: 'focusArea', label: 'Área de enfoque', placeholder: 'ej. Fuerza y Acondicionamiento' },
  { name: 'status', label: 'Estado', type: 'select', required: true, options: ['Programada', 'Completada', 'Cancelada'].map(s => ({ value: s, label: s })) },
]

export const progressFields = [
  { name: 'memberName', label: 'Nombre del miembro', required: true, placeholder: 'ej. Derek Holt', hint: 'Debe ser un miembro ya registrado' },
  { name: 'date', label: 'Fecha', type: 'date', required: true },
  { name: 'weight', label: 'Peso (lbs)', type: 'number', required: true },
  { name: 'bodyFatPct', label: 'Grasa corporal (%)', type: 'number', step: '0.1' },
  { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Notas de progreso…' },
]

export const leadFields = [
  { name: 'name', label: 'Nombre completo', required: true, placeholder: 'ej. Trevor Banks' },
  { name: 'phone', label: 'Teléfono', required: true, placeholder: '+1 555-0100' },
  { name: 'source', label: 'Origen del prospecto', placeholder: 'ej. Anuncio de Instagram' },
  { name: 'interestedPlan', label: 'Plan de interés', placeholder: 'ej. Básico Mensual' },
  { name: 'followUpDate', label: 'Fecha de seguimiento', type: 'date' },
  { name: 'status', label: 'Estado', type: 'select', required: true, options: ['Nuevo', 'Contactado', 'Prueba agendada', 'Convertido', 'Perdido'].map(s => ({ value: s, label: s })) },
]
