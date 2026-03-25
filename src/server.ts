import { config } from './config/env';
import { app } from './app';

app.listen(config.port, () => {
  console.log(`ITMS API running on port ${config.port}`);
});
