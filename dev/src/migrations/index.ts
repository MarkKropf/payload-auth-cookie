import * as migration_20251201_230440_cookie_plugin_mvp from './20251201_230440_cookie_plugin_mvp';
import * as migration_20251205_151635_add_email_verified from './20251205_151635_add_email_verified';

export const migrations = [
  {
    up: migration_20251201_230440_cookie_plugin_mvp.up,
    down: migration_20251201_230440_cookie_plugin_mvp.down,
    name: '20251201_230440_cookie_plugin_mvp',
  },
  {
    up: migration_20251205_151635_add_email_verified.up,
    down: migration_20251205_151635_add_email_verified.down,
    name: '20251205_151635_add_email_verified'
  },
];
