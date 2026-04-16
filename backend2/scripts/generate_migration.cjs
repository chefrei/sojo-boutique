const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const INPUT_FILE = path.join(__dirname, '..', 'data_dump.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'sync_production.sql');

// Configuración de Hashing (replicando src/lib/security.ts)
const PBKDF2_ITERATIONS = 29000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function hashPassword(password) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
    
    const saltB64 = salt.toString('base64');
    const hashB64 = hash.toString('base64');
    
    return `$pbkdf2-sha256$${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 1 : 0;
    return `'${String(val).replace(/'/g, "''")}'`;
}

async function run() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: No se encuentra ${INPUT_FILE}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    let sql = `-- ============================================================\n`;
    sql += `-- Migración Sincronizada de Soho Boutique (Python -> D1)\n`;
    sql += `-- Generado: ${new Date().toISOString()}\n`;
    sql += `-- ============================================================\n\n`;
    sql += `PRAGMA foreign_keys = OFF;\n\n`;

    // Orden de inserción para evitar problemas de FK
    const tableOrder = ['user', 'category', 'product', 'order', 'orderitem', 'payment', 'customerprofile', 'settings'];

    for (const table of tableOrder) {
        const rows = data[table];
        if (!rows || rows.length === 0) continue;

        sql += `-- Tabla: ${table}\n`;
        sql += `DELETE FROM "${table}";\n`; // Limpiar antes de insertar

        for (const row of rows) {
            // Transformaciones especiales
            if (table === 'user') {
                // 1. Minúsculas para roles
                row.role = row.role.toLowerCase();
                // 2. Nueva contraseña determinística para la migración
                const pass = (row.email === 'admin@sojaboutique.com') ? 'adminsojo123' : 'sojo123!';
                row.hashed_password = hashPassword(pass);
            }

            if (table === 'order') {
                row.status = row.status.toLowerCase();
                row.payment_status = row.payment_status.toLowerCase();
            }

            if (table === 'order' || table === 'payment') {
                // SQLite DATETIME lo guardaba como string en Python, se mantiene igual
            }

            const cols = Object.keys(row).map(c => `"${c}"`).join(', ');
            const vals = Object.values(row).map(v => escapeSql(v)).join(', ');
            
            sql += `INSERT INTO "${table}" (${cols}) VALUES (${vals});\n`;
        }
        sql += `\n`;
    }

    sql += `PRAGMA foreign_keys = ON;\n`;

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`¡Éxito! SQL de sincronización generado en: ${OUTPUT_FILE}`);
}

run();
