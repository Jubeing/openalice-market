/**
 * API Ninjas Provider.
 *
 * Endpoint: https://api.api-ninjas.com
 * Docs: https://api-ninjas.com/api/insidertrading
 *
 * Covers: US insider trading transactions (SEC filings).
 * Requires: X-Api-Key header (api_ninjas_api_key credential).
 */

import { Provider } from '../../core/provider/abstract/provider.js'
import { ApiNinjasInsiderTradingFetcher } from './models/insider-transactions.js'

export const apiNinjasProvider = new Provider({
  name: 'api_ninjas',
  description: 'API Ninjas — US insider trading from SEC filings (Form 3, 4, 5).',
  website: 'https://api-ninjas.com',
  credentials: ['api_key'],
  reprName: 'API Ninjas',
  fetcherDict: {
    InsiderTrading: ApiNinjasInsiderTradingFetcher,
  },
})