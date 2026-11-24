import { createApp } from './app';
import { loadConfig } from './config';

const config = loadConfig();
createApp(config).listen(config.port, () => {
  console.log(`[server] http://localhost:${config.port} (mock=${config.useMock})`);
});
