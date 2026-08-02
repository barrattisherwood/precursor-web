import { adminSecret } from './environment.secrets';

export const environment = {
  production: false,
  apiBase: '/api',
  sentryDsn: '',
  adminSecret,
};
