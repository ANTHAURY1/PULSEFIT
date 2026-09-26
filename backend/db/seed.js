// Datos de demostración. Ejecutar con: npm run seed
// Los "inscritos" y "miembros activos" salen de relaciones reales
// (class_enrollments, plan_id), no de números escritos a mano.
require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool = require('./pool')

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const passwordHash = await bcrypt.hash('pulsefit2026', 10)
    await client.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING`,
      ['admin', passwordHash, 'Administrador', 'admin']
    )

    const plans = [
      ['Básico Mensual', 'Mensual', 45, 'Acceso al gimnasio, vestidores'],
      ['Plus Trimestral', 'Trimestral', 120, 'Acceso al gimnasio + 2 clases grupales/semana'],
      ['Élite Anual', 'Anual', 420, 'Clases ilimitadas, 1 sesión de entrenamiento personal/mes, sauna'],
    ]
    const planIds = {}
    for (const [plan_name, duration, price, perks] of plans) {
      const r = await client.query(`INSERT INTO plans (plan_name, duration, price, perks) VALUES ($1,$2,$3,$4) RETURNING id`, [plan_name, duration, price, perks])
      planIds[plan_name] = r.rows[0].id
    }

    const trainers = [
      ['Entrenador Riley James', 'HIIT y Acondicionamiento', '+1 555-1201', 'riley.james@pulsefit.io', 'NASM-CPT', 'Activo'],
      ['Anya Petrova', 'Yoga y Movilidad', '+1 555-1212', 'anya.petrova@pulsefit.io', 'RYT-500', 'Activo'],
      ['Entrenador Marcus Diallo', 'Powerlifting', '+1 555-1223', 'marcus.diallo@pulsefit.io', 'Entrenador USAPL', 'En licencia'],
      ['Sophie Nakamura', 'Nutrición y Pérdida de Peso', '+1 555-1234', 'sophie.nakamura@pulsefit.io', 'Precision Nutrition L1', 'Activo'],
    ]
    const trainerIds = {}
    for (const [name, specialty, phone, email, certification, status] of trainers) {
      const r = await client.query(`INSERT INTO trainers (name, specialty, phone, email, certification, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [name, specialty, phone, email, certification, status])
      trainerIds[name] = r.rows[0].id
    }

    const members = [
      ['Derek Holt', 'derek.holt@example.com', '+1 555-1101', 'Élite Anual', '2024-01-15', 'Activo'],
      ['Mia Fontaine', 'mia.fontaine@example.com', '+1 555-1112', 'Básico Mensual', '2026-06-01', 'Activo'],
      ['Carlos Rivera', 'carlos.rivera@example.com', '+1 555-1123', 'Plus Trimestral', '2025-11-20', 'Activo'],
      ['Amy Chen', 'amy.chen@example.com', '+1 555-1134', 'Básico Mensual', '2026-03-10', 'Congelado'],
      ['Josh Turner', 'josh.turner@example.com', '+1 555-1145', 'Élite Anual', '2023-09-05', 'Activo'],
      ['Zoe Bennett', 'zoe.bennett@example.com', '+1 555-1156', 'Plus Trimestral', '2026-02-14', 'Vencido'],
    ]
    const memberIds = {}
    for (const [name, email, phone, planName, join_date, status] of members) {
      const r = await client.query(`INSERT INTO members (name, email, phone, plan_id, join_date, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [name, email, phone, planIds[planName], join_date, status])
      memberIds[name] = r.rows[0].id
    }

    const classes = [
      ['Bootcamp HIIT', 'Entrenador Riley James', 'Lun/Mié/Vie, 6:00 AM', 20],
      ['Yoga Vinyasa', 'Anya Petrova', 'Mar/Jue, 8:00 AM', 15],
      ['Powerlifting 101', 'Entrenador Marcus Diallo', 'Sáb, 10:00 AM', 10],
      ['Spin Cycle', 'Entrenador Riley James', 'Lun/Mié/Vie, 5:30 PM', 25],
    ]
    const classIds = {}
    for (const [class_name, trainerName, schedule, capacity] of classes) {
      const r = await client.query(`INSERT INTO classes (class_name, trainer_id, schedule, capacity) VALUES ($1,$2,$3,$4) RETURNING id`, [class_name, trainerIds[trainerName], schedule, capacity])
      classIds[class_name] = r.rows[0].id
    }

    const enrollments = [
      ['Bootcamp HIIT', 'Derek Holt'], ['Bootcamp HIIT', 'Mia Fontaine'], ['Bootcamp HIIT', 'Carlos Rivera'],
      ['Yoga Vinyasa', 'Mia Fontaine'], ['Yoga Vinyasa', 'Zoe Bennett'],
      ['Powerlifting 101', 'Derek Holt'], ['Powerlifting 101', 'Josh Turner'],
      ['Spin Cycle', 'Amy Chen'], ['Spin Cycle', 'Carlos Rivera'], ['Spin Cycle', 'Josh Turner'],
    ]
    for (const [className, memberName] of enrollments) {
      await client.query(`INSERT INTO class_enrollments (class_id, member_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [classIds[className], memberIds[memberName]])
    }

    const checkins = [
      ['Derek Holt', '2026-08-07', '6:15 AM', '75 min'],
      ['Mia Fontaine', '2026-08-07', '7:30 AM', '45 min'],
      ['Carlos Rivera', '2026-08-07', '5:45 PM', '60 min'],
      ['Josh Turner', '2026-08-06', '6:00 AM', '90 min'],
      ['Derek Holt', '2026-08-06', '6:10 AM', '70 min'],
    ]
    for (const [memberName, date, time, duration] of checkins) {
      await client.query(`INSERT INTO checkins (member_id, date, time, duration) VALUES ($1,$2,$3,$4)`, [memberIds[memberName], date, time, duration])
    }

    const payments = [
      ['Derek Holt', 'Élite Anual', 420, '2026-01-15', 'Pagado'],
      ['Mia Fontaine', 'Básico Mensual', 45, '2026-08-01', 'Pagado'],
      ['Carlos Rivera', 'Plus Trimestral', 120, '2026-08-05', 'Pendiente'],
      ['Amy Chen', 'Básico Mensual', 45, '2026-07-10', 'Vencido'],
      ['Josh Turner', 'Élite Anual', 420, '2025-09-05', 'Pagado'],
    ]
    for (const [memberName, planName, amount, date, status] of payments) {
      await client.query(`INSERT INTO payments (member_id, plan_id, amount, date, status) VALUES ($1,$2,$3,$4,$5)`, [memberIds[memberName], planIds[planName], amount, date, status])
    }

    const equipment = [
      ['Caminadora (Life Fitness T5)', 'Cardio', 8, 'Bueno', '2026-07-01'],
      ['Set de Barra Olímpica', 'Pesas Libres', 12, 'Bueno', '2026-06-15'],
      ['Máquina de Poleas Cruzadas', 'Fuerza', 2, 'Necesita reparación', '2026-05-20'],
      ['Máquina de Remo', 'Cardio', 4, 'Bueno', '2026-07-10'],
      ['Máquina de Prensa de Piernas', 'Fuerza', 1, 'Fuera de servicio', '2026-04-02'],
    ]
    for (const [equipment_name, category, quantity, condition, last_serviced] of equipment) {
      await client.query(`INSERT INTO equipment (equipment_name, category, quantity, condition, last_serviced) VALUES ($1,$2,$3,$4,$5)`, [equipment_name, category, quantity, condition, last_serviced])
    }

    const ptSessions = [
      ['Derek Holt', 'Entrenador Riley James', '2026-08-10', '7:00 AM', 'Fuerza y Acondicionamiento', 'Programada'],
      ['Josh Turner', 'Entrenador Marcus Diallo', '2026-08-05', '5:00 PM', 'Técnica de Powerlifting', 'Completada'],
      ['Amy Chen', 'Sophie Nakamura', '2026-08-11', '10:00 AM', 'Consulta de Nutrición', 'Programada'],
      ['Mia Fontaine', 'Anya Petrova', '2026-08-04', '8:00 AM', 'Flexibilidad y Movilidad', 'Cancelada'],
    ]
    for (const [memberName, trainerName, date, time, focus_area, status] of ptSessions) {
      await client.query(`INSERT INTO pt_sessions (member_id, trainer_id, date, time, focus_area, status) VALUES ($1,$2,$3,$4,$5,$6)`, [memberIds[memberName], trainerIds[trainerName], date, time, focus_area, status])
    }

    const progress = [
      ['Derek Holt', '2026-08-01', 182, 16.5, 'Bajó 3 lbs desde el último control, ganancias de fuerza en press de banca.'],
      ['Mia Fontaine', '2026-08-01', 138, 22.0, 'Mejoró su tiempo de 5k en 40 segundos.'],
      ['Josh Turner', '2026-07-28', 205, 14.0, 'Nuevo récord personal en peso muerto: 405 lbs.'],
      ['Amy Chen', '2026-07-25', 150, 24.5, 'Comienza plan de nutrición con Sophie esta semana.'],
    ]
    for (const [memberName, date, weight, body_fat_pct, notes] of progress) {
      await client.query(`INSERT INTO progress (member_id, date, weight, body_fat_pct, notes) VALUES ($1,$2,$3,$4,$5)`, [memberIds[memberName], date, weight, body_fat_pct, notes])
    }

    const leads = [
      ['Trevor Banks', '+1 555-1301', 'Anuncio de Instagram', 'Básico Mensual', '2026-08-10', 'Contactado'],
      ['Priya Kapoor', '+1 555-1312', 'Visita espontánea', 'Élite Anual', '2026-08-09', 'Prueba agendada'],
      ['Owen Marshall', '+1 555-1323', 'Referido - Derek Holt', 'Plus Trimestral', '2026-08-12', 'Nuevo'],
      ['Layla Hassan', '+1 555-1334', 'Búsqueda en Google', 'Básico Mensual', '2026-08-02', 'Convertido'],
      ['Ben Foster', '+1 555-1345', 'Anuncio de Instagram', 'Básico Mensual', '2026-07-30', 'Perdido'],
    ]
    for (const [name, phone, source, interested_plan, follow_up_date, status] of leads) {
      await client.query(`INSERT INTO leads (name, phone, source, interested_plan, follow_up_date, status) VALUES ($1,$2,$3,$4,$5,$6)`, [name, phone, source, interested_plan, follow_up_date, status])
    }

    await client.query('COMMIT')
    console.log('✔ Datos de demostración insertados correctamente.')
    console.log('  Usuario: admin   Contraseña: pulsefit2026')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('✘ Error al insertar datos de demostración:', err.message)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
