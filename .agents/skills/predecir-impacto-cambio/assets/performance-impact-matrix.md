| Cambio | Latencia | DB Load | Concurrency | Cache | Recomendación |
|---|---|---|---|---|---|
| [Query nueva] | +20ms | +1 conn | +100 pools | ✅ Si | Agregar índice |
| [API call nueva] | +200ms | No change | ±0 | ✅ Si | Cache 1h |
| [Loop agregado] | +5ms/item | No change | ±0 | No | Optimizar loop |
