const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const users = [
    {
        name: 'Administrador Principal',
        email: 'admin@fitflow.com',
        password: 'Admin123!',
        role: 'admin',
    },
    {
        name: 'Carlos Pérez - Entrenador',
        email: 'trainer@fitflow.com',
        password: 'Trainer123!',
        role: 'trainer',
    },
    {
        name: 'Juan García',
        email: 'user1@fitflow.com',
        password: 'User123!',
    },
    {
        name: 'María López',
        email: 'user2@fitflow.com',
        password: 'User123!',
    },
    {
        name: 'Usuario Inactivo',
        email: 'inactive@fitflow.com',
        password: 'User123!',
    },
];

async function seedUsers() {
    console.log('\n🌱 Sembrando usuarios de prueba...\n');
    console.log('='.repeat(50));

    let created = 0;
    let existing = 0;
    let errors = 0;

    for (const user of users) {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, user);
            console.log(`✅ Usuario creado: ${user.email} (${user.role || 'user'})`);
            created++;
        } catch (error) {
            if (error.response?.status === 409) {
                console.log(`⚠️  Usuario ya existe: ${user.email}`);
                existing++;
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`❌ Error: No se puede conectar al backend en ${API_URL}`);
                console.log(`   Asegúrate de que el backend esté corriendo`);
                errors++;
                break;
            } else {
                console.log(`❌ Error con ${user.email}: ${error.response?.data?.message || error.message}`);
                errors++;
            }
        }
    }

    console.log('='.repeat(50));
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Creados: ${created}`);
    console.log(`   ⚠️  Ya existían: ${existing}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📝 Total procesados: ${users.length}`);

    if (created > 0) {
        console.log(`\n🎉 Seed completado exitosamente!`);
        console.log(`\n📋 Credenciales de prueba:`);
        console.log(`   Admin:   admin@fitflow.com    / Admin123!`);
        console.log(`   Trainer: trainer@fitflow.com  / Trainer123!`);
        console.log(`   User1:   user1@fitflow.com    / User123!`);
        console.log(`   User2:   user2@fitflow.com    / User123!`);
    } else if (existing === users.length) {
        console.log(`\n✅ Todos los usuarios ya existen. No se creó ninguno nuevo.`);
    }

    console.log('');
}

seedUsers();