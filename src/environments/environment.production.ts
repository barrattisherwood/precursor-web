import { adminSecret } from './environment.secrets';

export const environment = {
  production: true,
  apiBase: '/api',
  sentryDsn: '',
  adminSecret,
};
