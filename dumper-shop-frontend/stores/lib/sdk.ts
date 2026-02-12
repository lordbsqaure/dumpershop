// src/lib/sdk.ts (or similar)
import Medusa from '@medusajs/js-sdk';

let MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'localhost:9000';

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // choose auth type here (see next section)
  auth: {
    type: 'session', // or "jwt"
  },
});
