
# Contract Mapping

Schemas in /schemas map to runtime contracts and API endpoints.
Examples:
- GearItem.schema.json -> POST /api/v1/gear (ingest) and GET /api/v1/gear/{id}
- Trip.schema.json -> POST /api/v1/trips/evaluate (input)
- AcceptanceResult.schema.json -> GET /api/v1/trips/{id}/result (output)
Ensure src/contracts are generated from these schemas before runtime.
