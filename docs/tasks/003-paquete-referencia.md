# Empaquetar un par de skills como paquete de referencia

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Crear un paquete conforme al formato definido a partir de una
configuración mínima —los skills `crear-tareas` y `ejecutar-tareas`,
que interactúan solo entre sí— para validar el formato como prueba de
concepto.

## Dependencias

- 002.

## Entrada

- El formato de paquete definido por la tarea 002.
- Los skills `crear-tareas` y `ejecutar-tareas` de `.agents/skills/`.

## Resultado esperado

- Un directorio de paquete de ejemplo en el repositorio que contiene
  solo esos dos skills, con manifiesto completo y conforme al
  contrato.

## Criterios de calidad

- El paquete contiene únicamente los dos skills elegidos, completos con
  sus archivos de referencia y plantillas.
- El paquete cumple el contrato del manifiesto sin campos inventados ni
  omitidos.
- El ejercicio deja registrada en las notas de la tarea al menos una
  decisión práctica del formato, ya sea un acierto o una fricción.

## Procedimiento sugerido

1. Aplicar la estructura del formato a los dos skills elegidos.
2. Rellenar el manifiesto con el caso real.
3. Anotar las fricciones encontradas; si alguna revela un defecto del
   formato, ajustarlo y registrar la corrección.

## Contexto

- Archivos similares:
  - `docs/formato-paquete.md` — el contrato a aplicar; su ejemplo ya
    usa los dos skills de esta tarea.
  - `.agents/skills/crear-tareas/` — `SKILL.md` + `assets/task.txt`.
  - `.agents/skills/ejecutar-tareas/` — solo `SKILL.md`.
  - `docs/decisions/D001`–`D004` — el paquete es un directorio con
    `teleprompter.json`, versión semver en el manifiesto y mapa de
    instalación explícito.
- Patrones:
  - No existe convención de ubicación para paquetes en el repo; esta
    tarea la crea.
  - `name` debe coincidir con el nombre del directorio del paquete.
- Lecciones: ninguna aplica (`docs/lessons/` no existe todavía).
- Decisiones: D001–D004 vigentes (manifiesto JSON puro, cardinalidad
  por campo `collection`, semver en manifiesto, mapa explícito).

## Conectividad

Veredicto: **conectada**.

Todo lo que la tarea asume existe: el formato de paquete
(`docs/formato-paquete.md`), los dos skills a empaquetar con sus
archivos completos y un ejemplo conforme ya redactado en el propio
documento de formato. No hay convención de ubicación para el paquete
de referencia, pero elegirla es parte del resultado esperado.

## Plan técnico

El proyecto es documental: el paquete de referencia vive en
`packages/ciclo-tareas/` (convención dominante para directorios de
paquetes; deja espacio a un manifiesto de colección futuro). `name` del
manifiesto = `ciclo-tareas`, coincidiendo con el directorio.

- [x] Crear el directorio del paquete y copiar los dos skills completos
  en `packages/ciclo-tareas/skills/{crear-tareas,ejecutar-tareas}/`,
  incluyendo `assets/task.txt`
  - Aporta: materializa la estructura del formato (directorio arbitrario
    de recursos).
  - Contexto: el paquete contiene copias —los originales en
    `.agents/skills/` siguen siendo los que usa este repositorio.
- [x] Redactar `teleprompter.json` conforme al contrato: `format`,
  `name`, `version`, `description`, `license`, `install` con dos
  entradas `skills/X/` → `.agents/skills/X/`, `requires.paths` con
  `{ "path": ".agents/skills/", "create": true }`, `metadata.origin`
  - Aporta: el manifiesto de referencia conforme.
  - Contexto: sin `personalization` — su contenido está fuera del
    alcance de la épica.
- [x] Verificar que los skills copiados funcionan de forma aislada:
  revisar que no referencien skills no incluidos en el paquete
  - Aporta: detecta acoplamiento oculto antes de dar por buena la
    configuración autocontenida.
  - Contexto: `ejecutar-tareas` invoca a otros skills
    (`desarrollar-tarea`, `revisar-implementacion`, `commit`…); si hay
    referencias externas, registrarlas como fricción y decidir el
    ajuste (ampliar el paquete, documentar la dependencia o acotar el
    alcance).
- [x] Verificar la conformidad del paquete contra el contrato y
  registrar en las notas de la tarea al menos una decisión o fricción
  - Aporta: cumple el criterio de calidad 3 y alimenta la tarea 004.

## Suite de pruebas esperada

Casos de uso: (UC1) el paquete contiene únicamente los skills elegidos
completos —ampliados a tres con `commit` por decisión del usuario—;
(UC2) el manifiesto es conforme al contrato; (UC3) el mapa de
instalación expresa el destino real de los skills; (UC4) los skills
empaquetados no dependen de skills ausentes del paquete.

- El paquete contiene solo `crear-tareas`, `ejecutar-tareas` y
  `commit`, completos con `assets/`/`references/` — UC1 (O/Z)
- `teleprompter.json` es JSON válido con `name`, `version`, `install` y
  ningún campo fuera del contrato — UC2 (B/E)
- `install` mapea cada `skills/X/` a `.agents/skills/X/` y cada
  `source` existe en el paquete — UC3 (I/M)
- `name` coincide con el nombre del directorio del paquete — UC2 (B)
- Los skills copiados no referencian skills ausentes del paquete, o la
  referencia queda resuelta/registrada — UC4 (B)
- Las notas de la tarea registran al menos una decisión o fricción —
  criterio 3

## Notas

- Premisa inicial (superada): los dos skills formaban una
  configuración autocontenida porque `ejecutar-tareas` consume lo que
  `crear-tareas` produce en `TODO.txt` y `docs/tasks/`. La
  verificación de aislamiento mostró que no bastaban entre sí —ver
  desviaciones—: el conjunto se amplió a tres con `commit`.

### Desviaciones del plan

- El paquete contiene tres skills, no dos: el usuario decidió incluir
  `commit` —la referencia más dura del ciclo— y podar el resto.
- Las copias de `crear-tareas` y `ejecutar-tareas` no son idénticas a
  las originales: las referencias a skills ausentes del paquete se
  eliminaron o se inlineó solo lo esencial (`consultar-lecciones` →
  eliminada; `idea-a-tarea` → eliminada; `revisar-implementacion` →
  verificar plan y suite; `registrar-experiencias` → eliminada;
  `documentar-dominio`/`documentar-producto`/`decisiones-diseno` →
  eliminadas; `planear-tarea`/`desarrollar-tarea` → comportamiento de
  planeación descrito inline en el registro de enrutado;
  `refinar-propuesta`/`planificar`/`revisar-redaccion`/
  `pulir-escritura` → eliminadas).
- Segunda poda por criterio del usuario: tampoco se referencian flujos
  ni documentos cuyo mecanismo mantenedor no viaja en el paquete. Se
  eliminó el modo «flujo de idea a tarea» de `crear-tareas` completo
  (dependía de `docs/proposals/` y de un orquestador externo), el
  manejo de líneas `[p]`, la consulta de `docs/lessons/` (propia y del
  subagente revisor), la lectura de épicas, el registro en
  `EXPERIENCIAS.md` y la evaluación de `docs/domains/`/`docs/decisions/`
  en `ejecutar-tareas`. El paquete solo referencia lo que él mismo
  produce: `TODO.txt`, `docs/tasks/` y git.

### Fricciones y decisiones del formato

- **Fricción — dependencias de capacidades inexpresables:** los skills
  se referencian entre sí por nombre, pero el formato solo puede
  declarar precondiciones de ruta (`requires.paths`). No distingue
  «este recurso usa otra capacidad» de «esta ruta debe existir», y
  declarar ~10 paths haría el paquete prácticamente ininstalable.
  Corrobora que posponer las dependencias entre paquetes fue correcto,
  pero queda una necesidad latente: dependencias a nivel de
  capacidad/skill, con distinción dura/blanda (la mayoría de las
  referencias eran condicionales).
- **Decisión — el paquete es snapshot, no vista:** el paquete contiene
  copias podadas de los skills, no los archivos originales. El
  `install` instala las copias; el repo original sigue usando
  `.agents/skills/` sin tocar.
- **Acierto — `create` justificado:** `requires.paths` con
  `create: true` en `.agents/skills/` permite instalar el paquete en
  un repositorio sin configuración previa.
- **Decisión — ubicación `packages/`:** convención dominante para
  directorios de paquetes; deja espacio a futuros paquetes y a un
  manifiesto de colección en la raíz.

## Revisión

- Subagente: 2026-09-28 — Aprueba (2ª pasada, tras la poda de flujos y
  mecanismos mantenedores ausentes)
- Usuario: 2026-09-28 — Aprueba
