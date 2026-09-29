# Definir el formato de paquete

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Fijar la estructura del directorio de paquete y el contrato del
manifiesto de Teleprompter, registrando las decisiones tomadas.

## Dependencias

- 001.

## Entrada

- El documento de investigación producido por la tarea 001.
- El problema y la forma de solución de la propuesta
  `docs/proposals/001-formato-paquete/propuesta.md`.

## Resultado esperado

- La estructura del directorio de paquete definida: ubicación del
  manifiesto, de los recursos y de las instrucciones de
  personalización.
- El contrato del manifiesto definido: campos obligatorios y
  opcionales, semántica de la versión, mapa de instalación y
  precondiciones del destino.
- Las decisiones costosas de revertir registradas con el mecanismo de
  decisiones de diseño del proyecto.

## Criterios de calidad

- El contrato declara identidad, versión, mapa de instalación,
  precondiciones y presencia de instrucciones de personalización.
- Cada campo tiene una razón de ser trazable al problema o a la
  investigación de apoyo.
- Las decisiones de diseño quedan registradas en `docs/decisions/`.

## Procedimiento sugerido

1. Derivar del documento de investigación los campos candidatos del
   manifiesto.
2. Definir la estructura del directorio del paquete.
3. Redactar el contrato del manifiesto con la semántica de cada campo.
4. Registrar las decisiones de diseño correspondientes.

## Contexto

- Archivos similares:
  - `docs/research/2026-09-formatos-manifiesto.md` — la investigación
    que produce la tarea 001; sus once decisiones candidatas son la
    entrada directa para derivar los campos del manifiesto.
  - `docs/proposals/001-formato-paquete/propuesta.md` — declara el
    contrato esperado del manifiesto (identidad, versión, mapa de
    instalación, precondiciones) y el fuera de alcance (mecanismo de
    instalación, contenido de las instrucciones de personalización).
  - `docs/epics/001-formato-paquete.md` — el plan técnico de la épica:
    artefactos declarativos sin código; las decisiones costosas de
    revertir se registran en `docs/decisions/`.
  - `.agents/skills/crear-tareas/` y `.agents/skills/ejecutar-tareas/` —
    el material real que el paquete de referencia (tarea 003) debe poder
    expresar; útiles como banco de pruebas mental de la estructura.
- Patrones:
  - Documentos en Markdown con líneas envueltas, encabezados ATX y
    secciones nombradas en español.
  - Las decisiones de diseño viven en `docs/decisions/DNNN-slug.md`
    (el directorio aún no existe; esta tarea lo crea).
- Lecciones: ninguna aplica (`docs/lessons/` no existe todavía).
- Decisiones: ninguna vigente (`docs/decisions/` no existe todavía).

## Conectividad

Veredicto: **conectada**.

La tarea produce artefactos declarativos (la definición del formato y
los registros de decisión), no código. Todo lo que asume existe: la
investigación de la tarea 001, la propuesta aprobada, el skill
`decisiones-diseno` para registrar las decisiones y el material real de
`.agents/skills/` que el formato debe poder expresar. El directorio
`docs/decisions/` aún no existe, pero crearlo es parte del resultado
esperado de la propia tarea, no una capacidad base ausente.

## Plan técnico

El proyecto es documental: el subsistema afectado es `docs/` más el
nuevo `docs/decisions/`. El banco de pruebas del formato son los skills
reales del repo (`.agents/skills/crear-tareas` y
`.agents/skills/ejecutar-tareas`), que el paquete de referencia de la
tarea 003 deberá expresar.

- [x] Derivar el contrato del manifiesto desde las once decisiones
  candidatas de la investigación
  - Aporta: fija la pieza central del formato; cada campo queda
    trazable a la evidencia que lo justifica.
  - Contexto: incluye la cardinalidad decidida en la revisión de 001 —
    un manifiesto en la raíz define un paquete único; un manifiesto de
    colección en la raíz lista varios paquetes por ruta.
- [x] Definir la estructura del directorio del paquete: ubicación del
  manifiesto, de los recursos y de las instrucciones de personalización
  - Aporta: la estructura física que la tarea 003 empaquetará.
- [x] Redactar el documento de definición del formato en
  `docs/formato-paquete.md`
  - Aporta: materializa el contrato donde la tarea 003 lo aplica y la
    004 lo convierte en especificación.
- [x] Registrar las decisiones costosas de revertir en
  `docs/decisions/` —elección del formato de datos, nombre y ubicación
  del manifiesto, cardinalidad y detección, semántica del mapa de
  instalación— creando el directorio y su índice
  - Aporta: cumple el criterio de calidad que exige las decisiones
    registradas.
  - Contexto: leer el skill `decisiones-diseno` antes de redactar para
    usar su plantilla exacta; el índice `docs/decisions/README.md`
    declara disparadores por decisión.

## Suite de pruebas esperada

Casos de uso: (UC1) un mantenedor determina qué hace válido un paquete;
(UC2) un consumidor inspecciona el manifiesto y sabe qué instala, dónde,
con qué precondiciones y si hay personalización; (UC3) se detecta si un
repo contiene uno o varios paquetes; (UC4) los dos skills del repo son
expresables por el formato.

- Un paquete sin personalización ni recursos opcionales sigue siendo
  válido — UC1 (Z)
- Un paquete mínimo —manifiesto + un recurso— queda descrito completo
  por la estructura — UC1 (O)
- Un repo con varios paquetes es detectable por la convención definida —
  UC3 (M)
- La ausencia de un campo obligatorio invalida el paquete — UC2 (B)
- El mapa de instalación expresa los dos skills de `.agents/skills/` con
  su destino — UC4 (I)
- Un campo desconocido dentro de un objeto conocido produce error; a
  nivel superior se ignora con aviso — UC2 (E)

## Revisión

- Subagente: 2026-09-28 — Aprueba (4ª pasada, tras la simplificación del
  contrato y el discriminador `collection`)
- Usuario: 2026-09-28 — Aprueba
