// Quick MySQL checks against the docker-compose container, on any OS.
// Usage: node scripts/db.mjs <status|users|count>
//
// The SQL runs inside the container through `sh -c`, so the MYSQL_* variables are
// expanded there (they come from .env via docker-compose) and never by the host shell.
import { spawnSync } from 'node:child_process';

const CONTAINER = 'fitflow-mysql';

const commands = {
  status: {
    sql: 'SHOW DATABASES;',
    login: 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot',
    onError: 'MySQL no esta disponible',
  },
  users: {
    sql: 'SELECT name, email, role FROM users;',
    login: 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"',
    onError: 'No hay usuarios o la base no esta disponible',
  },
  count: {
    sql: 'SELECT COUNT(*) AS total_usuarios FROM users;',
    login: 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"',
    onError: 'No hay usuarios o la base no esta disponible',
  },
};

const command = commands[process.argv[2]];
if (!command) {
  console.error(`Uso: node scripts/db.mjs <${Object.keys(commands).join('|')}>`);
  process.exit(1);
}

const { status } = spawnSync(
  'docker',
  ['exec', CONTAINER, 'sh', '-c', `${command.login} -e "${command.sql}"`],
  { stdio: 'inherit' }
);

if (status !== 0) {
  console.error(command.onError);
  process.exit(1);
}
