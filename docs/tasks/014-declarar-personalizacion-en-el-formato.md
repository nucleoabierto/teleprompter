# Declarar las instrucciones de personalización en el formato de paquete

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Extender el formato de paquete con un campo específico del manifiesto
que apunta al archivo con las instrucciones de personalización. El
contenido del archivo es de formato libre —texto dirigido a un
agente, sin formato impuesto ni validación de contenido—. La
declaración queda especificada para mantenedores y ejercida por el
paquete de referencia.

## Dependencias

- Ninguna: la forma de la declaración está fijada por la propuesta
  y no necesita la investigación de la tarea 013, que solo alimenta
  la entrega.

## Entrada

- La propuesta en `docs/proposals/003-personalizacion-guiada/`.
- La especificación del formato en `docs/especificacion-paquete.md` y
  su contrato en `docs/formato-paquete.md`.
- La validación del manifiesto en `src/manifest.js` y el paquete de
  referencia en `packages/ciclo-tareas/`.

## Resultado esperado

- El manifiesto admite el campo que apunta al archivo de
  instrucciones dentro del paquete, con las validaciones que
  correspondan a una referencia de archivo.
- El contenido del archivo no se valida: cualquier texto del
  mantenedor es válido.
- `docs/especificacion-paquete.md` y `docs/formato-paquete.md`
  documentan la declaración para mantenedores.
- El paquete de referencia declara instrucciones reales de
  personalización de sus propios recursos.

## Criterios de calidad

- Un manifiesto sin el campo sigue siendo válido: la personalización
  es opcional y los paquetes existentes no se invalidan.
- Una declaración que apunta a un archivo inexistente o fuera del
  paquete produce el mismo tipo de error de manifiesto que los campos
  existentes.
- El contenido del archivo nunca produce errores de validación:
  formato libre.
- La especificación documenta qué declara el mantenedor, con la
  misma forma de contrato que el resto del formato.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar el nombre y la forma del campo; si la elección es costosa
   de revertir, registrar la decisión en `docs/decisions/`.
2. Extender la validación del manifiesto y sus pruebas.
3. Actualizar la especificación y el formato para mantenedores.
4. Añadir las instrucciones de personalización reales al paquete de
   referencia `ciclo-tareas`.

## Notas

- Las instrucciones deben quedar materializadas en el destino para
  poder consultarse tras la instalación —el origen remoto es
  temporal—: cómo —recurso instalado, referencia en el registro u
  otra— es parte de lo que esta tarea fija junto a la declaración.

## Contexto

- **Archivos similares:**
  - `src/manifest.js` — `checkPersonalization` ya valida la forma de
    la ruta vía `checkRelativePath`; `checkInstallEntry` muestra el
    patrón de validación de existencia con `hasEntry` que falta
    aplicar aquí.
  - `docs/formato-paquete.md` y `docs/especificacion-paquete.md` —
    el campo `personalization` ya está documentado («no se instalan
    salvo que también figuren en `install`»); la tarea revisa ese
    contrato a la luz de la materialización en el destino.
  - `src/cli.js` — ya imprime `personalización: instrucciones en
    "…" del paquete` al final de la instalación; la entrega del
    contenido corresponde a la tarea 015.
  - `packages/ciclo-tareas/` — paquete de referencia sin
    `personalization` (excluido a propósito en la tarea 003); la
    tarea le añade instrucciones reales.
  - `test/manifest.test.js` — cubre la forma del campo; modelo para
    las pruebas de existencia.
- **Patrones:**
  - Un campo opcional del manifiesto se valida con una función en
    `VALIDATORS` que solo actúa si el campo está presente.
  - Las rutas que apuntan dentro del paquete usan
    `checkRelativePath` + `hasEntry` (modelo `install.source`).
  - Cobertura obligatoria del 100 % sobre `src/`; mensajes en
    español; campos desconocidos de nivel superior → aviso.
- **Lecciones:** ninguna aplica —no existe `docs/lessons/`—.
- **Decisiones:**
  - D002 — `personalization` no aplica a colecciones; su presencia
    en un manifiesto de colección ya es error.
  - D005 — la materialización de la guía en el destino, si se fija,
    debe formar parte del plan completo calculado antes de escribir.
  - D007 — si la guía se instala en el destino, el registro la
    recuerda como recurso propio.
- **Vacío detectado / punto abierto:** el formato ya declara el
  campo, pero el contrato actual dice que la guía «no se instala» —
  incompatible con la consulta posterior que la propuesta exige, ya
  que el origen remoto es temporal. La planeación decide el
  mecanismo de materialización (auto-instalación a una ubicación
  convencional vs. exigirla en `install` vs. registro en el lock).

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe: `src/manifest.js` ya reconoce
`personalization` y expone el patrón `checkRelativePath` + `hasEntry`
para validar la existencia dentro del paquete; `src/plan.js`
(`buildPlan`) ya materializa recursos con clasificación
create/identical/managed-update/conflict y `src/cli.js` ya lee
`manifest.personalization` en la salida. Si la planeación decide
auto-materializar la guía, añadir una entrada sintética al plan es un
cambio absorbible por la tarea sobre esa maquinaria. El paquete de
referencia `packages/ciclo-tareas/` existe y solo necesita el archivo
de instrucciones y el campo. La documentación del formato ya menciona
el campo, así que la actualización es un ajuste de contrato, no una
sección nueva.

## Plan técnico

El manifiesto ya reconoce `personalization` como ruta relativa dentro
del paquete y el CLI ya anuncia su presencia al final de la
instalación. Lo que falta es su semántica material: la guía debe
llegar al destino siempre —el origen remoto es temporal— y quedar
localizable para la consulta posterior. La decisión aprobada es que
la ubicación la fija la herramienta, no el mantenedor: el archivo se
copia a `.teleprompter/<paquete>/<nombre-del-archivo>`, un namespace
gestionado como `teleprompter-lock.json`, sin pasar por el mapa
`install` ni listarse entre sus recursos (el campo ya indica dónde
está el archivo; mostrarlo en el plan sería redundante). El contrato
se estrecha a «archivo» —un directorio no es mostrable—.

- [x] Endurecer `checkPersonalization`: exigir existencia dentro del
  paquete y que la entrada sea un archivo, no un directorio
  - Aporta: toda declaración apunta a una guía real y mostrable;
    `archivo inexistente → error de manifiesto` queda cubierto
  - Contexto: la forma ya se valida con `checkRelativePath`;
    `hasEntry` sobre `path.join(pkgDir, value)` sigue el patrón de
    `install.source`; archivo vs. directorio con `fs.statSync`
- [x] Reservar `.teleprompter/` como namespace gestionado: `install`
  con `target` dentro de él produce error de manifiesto
  - Aporta: el destino de la guía es propiedad de la herramienta —
    misma regla que `teleprompter-lock.json`— y el mantenedor no
    puede colisionar con lo gestionado
  - Contexto: la comprobación va en el bucle de colisiones de
    `checkInstall`, junto al `target` reservado existente
- [x] Materializar la guía en la ejecución: tras `executePlan`, copiar
  `personalization` a `.teleprompter/<name>/<basename>` con
  creación de directorios, fuera del plan y sus recursos
  - Aporta: la guía llega al destino en instalaciones locales y
    remotas sin exigir nada al `install` del mantenedor
  - Contexto: `.teleprompter/` es propiedad de la herramienta —no
    hay detección de colisión ahí, como tampoco la hay para el
    lock—; el anuncio existente de `personalización:` actualiza su
    texto a la ubicación gestionada
- [x] Registrar la guía en el lock: `personalization: <target>`
  en la entrada del paquete y el archivo en `files`
  - Aporta: la consulta posterior (tarea 015) localiza el archivo
    sin reconstruir la convención, y el fichero queda auditable
    como lo demás gestionado (D007)
  - Contexto: `writeLock` compone `files` desde `actions`; la copia
    gestionada se añade como acción sintética con su `sha256`;
    `isValidLock` ya tolera campos extra en la entrada del paquete
- [x] Actualizar el contrato en `docs/formato-paquete.md` y
  `docs/especificacion-paquete.md`
  - Aporta: el especificador del mantenedor describe la semántica
    real —archivo de texto libre, no validado, no ejecutable,
    instalado por la herramienta en `.teleprompter/<paquete>/`—
    en lugar del «no se instala» vigente
- [x] Registrar la decisión de la ubicación gestionada con
  `decisiones-diseno`
  - Aporta: `.teleprompter/` y el campo del lock son un contrato
    costoso de revertir una vez publicado en paquetes e
    instalaciones
- [x] Añadir la guía real al paquete de referencia:
  `packages/ciclo-tareas/PERSONALIZE.md` + campo `personalization`
  en su manifiesto
  - Aporta: la característica queda ejercida por un paquete real —
    criterio de la tarea— y la tarea 015 dispone de un paquete con
    guía para probar la entrega

## Suite de pruebas esperada

De UC1 «declarar la guía en el manifiesto»:

- Un manifiesto sin `personalization` sigue siendo válido (Z).
- `personalization` apuntando a un archivo existente del paquete es
  válido (O).
- `personalization` apuntando a una ruta inexistente produce error
  de manifiesto (E).
- `personalization` apuntando a un directorio existente produce
  error: la guía es un archivo (B).
- `personalization` con ruta absoluta o que escapa del paquete
  produce error (B — la forma ya estaba cubierta, regresión).
- El contenido del archivo de instrucciones es libre: cualquier
  texto —incluido no-markdown o instrucciones ambiguas— no produce
  error ni aviso de manifiesto (I).

De UC2 «proteger el namespace gestionado»:

- Una entrada de `install` con `target` dentro de `.teleprompter/`
  produce error de manifiesto (E).

De UC3 «la guía materializa en el destino sin figurar en install»:

- Instalar un paquete con `personalization` copia el archivo a
  `.teleprompter/<paquete>/<nombre>` en el destino aunque no figure
  en `install` (I).
- La copia gestionada no aparece entre los recursos del plan
  impreso (I).
- `teleprompter-lock.json` registra `personalization` con el
  target gestionado y el archivo entre `files` (I).
- Un paquete sin `personalization` no añade el campo al lock (Z).
- Regresión: la instalación del paquete de referencia, ahora con
  guía, sigue completa —recursos + guía + lock—.

## Desviaciones del plan

- **Registro de la guía en el lock sin acción sintética.** El plan
  preveía añadir la copia gestionada como acción sintética en
  `actions`; se implementó dejando `actions` con los recursos del
  mantenedor solamente y haciendo que `writeLock` añada el registro
  del archivo gestionado por su cuenta. Motivo: coherencia con la
  decisión de no mostrar la guía entre los recursos de `install` —
  con la acción sintética habría salido como `create
  .teleprompter/...` en la sección `resultado:`—. Decisión: mismo
  efecto observable en el lock (`files` + campo `personalization`)
  con salida limpia.
- **Pre-verificación del destino gestionado antes de escribir.** El
  plan copiaba la guía tras `executePlan` con la guarda de escape en
  la copia misma; la revisión detectó que un `.teleprompter` hostil
  dejaba los recursos escritos sin registro, contra D005. Decisión:
  `cli` verifica `resolvesUnder` del destino gestionado antes de
  `executePlan` —un escape hace el plan no ejecutable (código 2)
  sin escribir nada—; la guarda interna de `installPersonalization`
  se conserva como defensa de la API.
- **La reserva de `.teleprompter/` cubre también `requires.paths`.**
  El plan la limitaba a `install[].target`; la revisión señaló que
  un `requires.paths` con `create` podía crear dentro del namespace
  gestionado. Decisión: misma regla de prefijo reservado en
  `checkRequiresEntry`.
- **Guía-enlace contenida en el paquete.** La revisión observó que
  `copyFileSync` desreferencia enlaces —una guía-symlink a un
  archivo externo copiaría contenido ajeno vía `--path`—. Decisión:
  `checkPersonalization` exige que el enlace resuelva dentro del
  paquete; contenido de enlaces internos sí se materializa.
- **`overwrite` en el registro de la guía.** `writeLock` registraba
  siempre `create`; ahora registra `overwrite` cuando la ruta
  gestionada ya figuraba en la instalación previa, igual que el
  resto de entradas.

## Revisión

- Subagente: 2026-09-29 — Aprueba (ronda 2; ronda 1 solicitó cambios
  por F1–F4, resueltos: pre-verificación del destino gestionado,
  reserva en `requires.paths`, `overwrite` en el registro, enlace
  contenido en el paquete; quedan observaciones cosméticas)
- Usuario: 2026-09-29 — Aprueba
