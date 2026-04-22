# Patch: Add API Ninjas as OpenTypeBB Provider

## Summary

Adds **API Ninjas** (`api_ninjas`) as a built-in provider in OpenTypeBB, enabling US insider trading data via the SEC Form 3/4/5 filings.

## Files Changed

### New Files

- `packages/opentypebb/src/providers/api_ninjas/index.ts` — Provider definition
- `packages/opentypebb/src/providers/api_ninjas/models/insider-transactions.ts` — InsiderTrading fetcher

### Modified Files

| File | Change |
|------|--------|
| `packages/opentypebb/src/index.ts` | Export `apiNinjasProvider` |
| `packages/opentypebb/src/core/api/app-loader.ts` | Register provider via `includeProvider(apiNinjasProvider)` |
| `packages/opentypebb/src/standard-models/insider-trading.ts` | Extended schema with transaction_code, transaction_value, etc. |
| `src/connectors/web/routes/config.ts` | Added `api_ninjas` to `TEST_ENDPOINTS` |
| `src/domain/market-data/credential-map.ts` | Mapped `api_ninjas` → `api_ninjas_api_key` |

## Provider Details

- **Name**: `api_ninjas`
- **Credential**: `api_ninjas_api_key` (stored in header `X-Api-Key`)
- **Endpoint**: `GET https://api.api-ninjas.com/v1/insidertransactions`
- **Documentation**: https://api-ninjas.com/api/insidertrading
- **Covers**: US insider trading (SEC Form 3, 4, 5 filings)
- **Free tier**: Limited requests/month; `limit` param is premium-only

## Test

```bash
curl -X POST http://localhost:3002/api/market-data/test-provider \
  -H "Content-Type: application/json" \
  -d '{"provider":"api_ninjas","key":"YOUR_API_KEY"}'
```

Returns `{ "ok": true }` if the API key is valid.
