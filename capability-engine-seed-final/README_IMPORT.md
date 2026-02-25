Capability Engine Seed - Final (json-rules-engine based evaluator)
=================================================================

This package seeds a capability-driven gear engine with:
- Canonical JSON Schemas (schemas/)
- Policy-as-data rules (rules/)
- A TypeScript evaluator skeleton that uses 'json-rules-engine' (src/policy/capability/)
- Examples (examples/) including one passing and one failing fixture
- Documentation (docs/)

Important notes
- This package **does not** include package.json or node_modules. You will wire package manager and add dependencies (e.g., json-rules-engine, ajv) in your project.
- Schemas are the source of truth. Generate runtime TS types into src/contracts/ from schemas/ (recommended json-schema-to-typescript).
- Rules are policy-as-data and are loaded by the evaluator. The evaluator skeleton provided expects the 'json-rules-engine' npm package.

Quick usage (local)
1. Copy files into your repo.
2. Install dependencies: e.g. npm i json-rules-engine ajv
3. Generate types from schemas (recommended).
4. Import and call the evaluator:

```ts
import { evaluateTrip } from './src/policy/capability/evaluator';
const trip = require('./examples/trip.seed.json');
const gear = require('./examples/gear.seed.json');
const tests = require('./examples/field-tests.seed.json');
const bundleMeta = require('./rules/policy.meta.json');

const result = await evaluateTrip({trip, gear, tests, bundleMeta});
console.log(result);
```

Design choices
- Option B chosen: evaluator uses an existing JSON rules engine (json-rules-engine) but rules are authored as deterministic policy JSON.
- Deterministic rules and bundle hashing are used for immutability & auditability.

Next steps
- Add package.json, codegen scripts, CI steps in your main repo (not included here).
- Replace evaluator skeleton with production-ready rule loading and strict fact mapping.
