// Serves the production build on $PORT (default 4200), on any OS.
// `serve` alone defaults to port 3000, which clashes with the backend.
const { spawnSync } = require('child_process');

const port = process.env.PORT || '4200';
const { status } = spawnSync('serve', ['-c', 'serve.json', '-l', port], {
  stdio: 'inherit',
  shell: true,
});

process.exit(status ?? 1);
