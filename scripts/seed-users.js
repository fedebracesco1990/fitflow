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
    shouldBeInactive: true,
  },
];

async function seedUsers() {
  console.log('\n🌱 Sembrando usuarios de prueba...\n');
  console.log('='.repeat(50));

  let created = 0;
  let existing = 0;
  let errors = 0;
  let adminToken = null;
  const usersToDeactivate = [];

  for (const user of users) {
    try {
      const { shouldBeInactive, ...userData } = user;
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log(`✅ Usuario creado: ${user.email} (${user.role || 'user'})`);
      created++;

      // Guardar token del admin para usarlo después
      if (user.role === 'admin') {
        adminToken = response.data.accessToken;
      }

      // Marcar usuario para desactivar después
      if (shouldBeInactive) {
        usersToDeactivate.push(user.email);
      }
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
        console.log(
          `❌ Error con ${user.email}: ${error.response?.data?.message || error.message}`
        );
        errors++;
      }
    }
  }

  // Desactivar usuarios marcados
  if (usersToDeactivate.length > 0 && adminToken) {
    console.log('\n🔒 Desactivando usuarios...');

    // Obtener lista de usuarios para encontrar el ID
    try {
      const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      for (const email of usersToDeactivate) {
        const userToDeactivate = usersResponse.data.find((u) => u.email === email);
        if (userToDeactivate) {
          await axios.patch(
            `${API_URL}/users/${userToDeactivate.id}`,
            { isActive: false },
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          console.log(`🔒 Usuario desactivado: ${email}`);
        }
      }
    } catch (error) {
      console.log(
        `❌ Error al desactivar usuarios: ${error.response?.data?.message || error.message}`
      );
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
    console.log(`   Admin:    admin@fitflow.com    / Admin123!`);
    console.log(`   Trainer:  trainer@fitflow.com  / Trainer123!`);
    console.log(`   User1:    user1@fitflow.com    / User123!`);
    console.log(`   User2:    user2@fitflow.com    / User123!`);
    console.log(`   Inactive: inactive@fitflow.com / User123! (desactivado)`);
  } else if (existing === users.length) {
    console.log(`\n✅ Todos los usuarios ya existen. No se creó ninguno nuevo.`);
  }

  console.log('');
}

seedUsers();
