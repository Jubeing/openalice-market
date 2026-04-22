/**
 * API Ninjas Insider Trading Fetcher.
 *
 * Endpoint: https://api.api-ninjas.com/v1/insidertransactions
 * Docs: https://api-ninjas.com/api/insidertrading
 *
 * Requires: X-Api-Key header (api_ninjas_api_key credential).
 * Free tier: limited requests/month.
 * Covers: US equities only (SEC data).
 */

import { z } from 'zod'
import { Fetcher } from '../../../core/provider/abstract/fetcher.js'
import { InsiderTradingQueryParamsSchema, InsiderTradingDataSchema } from '../../../standard-models/insider-trading.js'
import { amakeRequest } from '../../../core/provider/utils/helpers.js'
import { OpenBBError } from '../../../core/provider/utils/errors.js'

// ==================== Provider-specific query schema ====================

export const ApiNinjasInsiderTradingQueryParamsSchema = InsiderTradingQueryParamsSchema.extend({
  // symbol is optional here — API Ninjas uses `ticker` instead, handled in extractData
  symbol:     z.string().nullable().optional(),
  ticker:     z.string().nullable().default(null).describe('Ticker symbol (e.g. AAPL).'),
  name:       z.string().nullable().default(null).describe('Exact insider name match.'),
  form_type:  z.string().nullable().default(null).describe('SEC form type: 3, 4, or 5.'),
  transaction_code: z.string().nullable().default(null).describe('Transaction code: P (Purchase), S (Sale), A (Award).'),
  min_transaction_value: z.number().nullable().default(null).describe('Minimum transaction value in USD.'),
  max_transaction_value: z.number().nullable().default(null).describe('Maximum transaction value in USD.'),
})

export type ApiNinjasInsiderTradingQueryParams = z.infer<typeof ApiNinjasInsiderTradingQueryParamsSchema>

// ==================== Raw API response shape ====================

export interface ApiNinjasInsiderTransaction {
  accession_number:          string
  form:                      string
  filing_date:               string
  sec_filing_url:           string
  cik:                       string
  ticker:                    string
  company_name:             string
  insider_name:              string
  insider_position:         string
  transaction_code:         string
  transaction_name:         string
  transaction_type:        string
  transaction_price:        number
  shares:                   number
  transaction_value:        number
  pre_transaction_shares:    number
  pre_transaction_shares_value: number
  remaining_shares:         number
  remaining_shares_value:  number
}

// ==================== Fetcher ====================

export class ApiNinjasInsiderTradingFetcher extends Fetcher {
  static override readonly endpoint = '/v1/insidertransactions'
  static override readonly tags = ['insider trading', 'US equities', 'SEC filings']

  static override transformQuery(params: Record<string, unknown>): ApiNinjasInsiderTradingQueryParams {
    return ApiNinjasInsiderTradingQueryParamsSchema.parse(params)
  }

  static override async extractData(
    query: ApiNinjasInsiderTradingQueryParams,
    credentials: Record<string, string> | null,
  ): Promise<ApiNinjasInsiderTransaction[]> {
    const apiKey = credentials?.api_ninjas_api_key
    if (!apiKey) throw new OpenBBError('API Ninjas requires an api_ninjas_api_key credential.')

    const params = new URLSearchParams()
    // Support both `ticker` (API Ninjas native) and `symbol` (standard model alias)
    const ticker = query.ticker ?? query.symbol ?? undefined
    if (ticker)             params.set('ticker', ticker)
    if (query.name)         params.set('name', query.name)
    if (query.form_type)    params.set('form_type', query.form_type)
    if (query.transaction_type) params.set('transaction_type', query.transaction_type)
    if (query.transaction_code) params.set('transaction_code', query.transaction_code)
    if (query.insider_type) params.set('insider_type', query.insider_type)
    if (query.start_date)   params.set('min_transaction_date', query.start_date)
    if (query.end_date)     params.set('max_transaction_date', query.end_date)
    if (query.min_transaction_value) params.set('min_transaction_value', String(query.min_transaction_value))
    if (query.max_transaction_value) params.set('max_transaction_value', String(query.max_transaction_value))

    const limit = query.limit && query.limit <= 100 ? query.limit : 20
    params.set('limit', String(limit))

    const url = `https://api.api-ninjas.com/v1/insidertransactions?${params.toString()}`

    const raw = await amakeRequest<ApiNinjasInsiderTransaction[]>(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    })

    return raw
  }

  static override transformData(
    query: ApiNinjasInsiderTradingQueryParams,
    data: ApiNinjasInsiderTransaction[],
  ): InsiderTradingDataSchema[] {
    // Sort newest first
    const sorted = [...data].sort((a, b) =>
      String(b.filing_date ?? '').localeCompare(String(a.filing_date ?? '')),
    )

    return sorted.map((d) =>
      InsiderTradingDataSchema.parse({
        symbol:                    d.ticker ?? null,
        company_cik:              d.cik ?? null,
        filing_date:              d.filing_date ?? null,
        transaction_date:         null,  // API does not provide separate transaction date
        owner_name:               d.insider_name ?? null,
        owner_title:              d.insider_position ?? null,
        ownership_type:           null,
        transaction_type:         d.transaction_type ?? null,
        acquisition_or_disposition: null,
        security_type:            d.transaction_name ?? null,
        transaction_price:         d.transaction_price ?? null,
        filing_url:               d.sec_filing_url ?? null,
        transaction_code:         d.transaction_code ?? null,
        transaction_value:        d.transaction_value ?? null,
        securities_transacted:    d.shares ?? null,
        pre_transaction_shares:   d.pre_transaction_shares ?? null,
        remaining_shares:         d.remaining_shares ?? null,
      }),
    )
  }
}