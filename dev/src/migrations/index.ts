import * as migration_20251201_230440_cookie_plugin_mvp from './20251201_230440_cookie_plugin_mvp';

export const migrations = [
  {
    up: migration_20251201_230440_cookie_plugin_mvp.up,
    down: migration_20251201_230440_cookie_plugin_mvp.down,
    name: '20251201_230440_cookie_plugin_mvp'
  },
];
