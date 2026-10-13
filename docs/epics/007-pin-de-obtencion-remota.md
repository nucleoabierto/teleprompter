# Pin de obtención remota

## Estado

[x] Planificada | [ ] Completada

## Objetivo

Toda obtención remota deja anclada su procedencia: la obtención
resuelve la referencia pedida al commit exacto y el registro lo
conserva junto al origen, de modo que «qué árbol produjo esta
instalación» es un dato del lock, no una suposición.

## Alcance

- **Dentro:** resolución de la referencia pedida —rama, etiqueta
  o rama por defecto— al SHA que el remoto resolvía durante la
  obtención; registro del commit en el origen del lock, escrito
  en la instalación y refrescado en la actualización;
  compatibilidad con registros sin el campo.
- **Fuera:** exponer la señal «el remoto avanzó sin bump» en las
  operaciones de consulta; reproducción del destino desde el
  registro; anclaje de orígenes locales; backfill en registros
  escritos con la forma anterior; verificación de integridad del
  contenido.

## Piezas

- [ ] docs/tasks/037-resolver-el-commit-en-la-obtencion.md —
  Resolver el commit exacto en la obtención remota
- [ ] docs/tasks/038-registrar-el-commit-en-el-origen.md —
  Registrar el commit obtenido en el origen del registro

## Plan técnico

El conjunto divide capacidad de registro: la obtención aprende a
declarar qué resolvió antes de que el registro aprenda a
conservarlo.

- **Orden:** 037 precede a 038 —la resolución es la entrada del
  registro—.
- **Dependencias:** 038 consume el SHA que 037 añade al resultado
  de la obtención.
- **Decisiones transversales:**
  - La resolución es una consulta extra por obtención al endpoint
    de commits del proveedor, bajo los mismos presupuestos de
    timeout, tamaño y diagnóstico que rigen la obtención
    endurecida —evidencia del sondeo en la propuesta 008—.
  - Una referencia que ya es un SHA completo se toma por resuelta
    sin consulta extra.
  - La actualización conserva su semántica de avance: el commit
    se refresca con cada obtención, nunca congela el avance.
  - El origen remoto declara el commit como campo opcional:
    registros anteriores sin él siguen siendo válidos.
  - La referencia pedida se conserva junto al ancla: la
    referencia móvil expresa la intención —«seguir esta rama»— y
    el commit expresa lo obtenido.

## Criterio de cierre

Tras instalar un paquete desde un origen remoto, el registro
declara el commit que el remoto resolvía para la referencia en ese
momento —con o sin referencia explícita—; tras actualizar, el
commit refleja el árbol efectivamente instalado; y un registro
sin commit sigue operando sin corrección.

## Revisión

- Usuario: 2026-10-12 — Aprueba
