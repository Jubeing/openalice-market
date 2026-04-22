# Patch 002: Fix FMP, FRED, EIA Provider Credentials and Test Endpoints

## Summary

Fixes credential key mapping and test endpoint configuration for FMP, FRED, and EIA providers.

## Files Changed

### Modified Files

| File | Change |
|------|--------|
| `packages/opentypebb/src/providers/eia/index.ts` | `credentials: ['eia_api_key']` → `['api_key']` (auto-prefix gives correct `eia_api_key`) |
| `packages/opentypebb/src/providers/eia/models/short-term-energy-outlook.ts` | Fix sort param (JSON string → separate URL params), `value` string→number conversion |
| `packages/opentypebb/src/providers/federal_reserve/utils/fred-helpers.ts` | `getFredApiKey()` adds `federal_reserve_api_key` fallback |
| `src/connectors/web/routes/config.ts` | FRED: `provider: 'fred'` → `'federal_reserve'`, `credField: 'fred_api_key'` → `'federal_reserve_api_key'`; FMP: `EquityScreener` → `EquityInfo` (free endpoint) |

## Fixes Detail

### EIA
- **Credential**: `eia_api_key` → `api_key` (constructor auto-prefixes to `eia_api_key`)
- **Sort**: EIA API v2 rejects JSON string; split into `sort[0][column]` and `sort[0][direction]`
- **Value**: EIA v2 returns numeric strings; added `Number()` conversion

### FRED
- **Provider name**: `fred` → `federal_reserve` (actual provider name in OpenTypeBB registry)
- **Credential**: `fred_api_key` → `federal_reserve_api_key` (auto-prefix from `federal_reserve` provider)
- **Helper**: `getFredApiKey()` now checks `federal_reserve_api_key` fallback

### FMP
- **Model**: `EquityScreener` (requires paid subscription) → `EquityInfo` (free endpoint)
