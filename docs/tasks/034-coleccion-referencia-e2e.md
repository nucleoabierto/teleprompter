# Colección de referencia e instalación de extremo a extremo

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Crear una colección de referencia real —análoga al paquete
`ciclo-tareas`— y validar el flujo completo de extremo a extremo:
seleccionar e instalar un paquete de la colección, consultar su
guía y actualizarlo. La colección de referencia sirve a la vez de
ejemplo documentado para mantenedores.

## Dependencias

- Tarea 032 — la instalación desde colección materializada.
- Tarea 033 — `origin` y ciclo de vida por paquete.

## Entrada

- `packages/ciclo-tareas/` — el paquete de referencia existente;
  este propio repositorio es candidato natural a alojar la
  colección de referencia (varios paquetes propios bajo
  `packages/`).
- `docs/especificacion-paquete.md` — el contrato del manifiesto de
  colección.
- El comportamiento definido en la tarea 031.

## Resultado esperado

- Una colección de referencia publicable con su `teleprompter.json`
  de colección y al menos dos paquetes, conforme a la
  especificación.
- Verificación e2e documentada: instalación con selección,
  comportamiento sin selección, `guide` sobre el paquete instalado
  y `update` resolviendo el mismo paquete.

## Criterios de calidad

- El manifiesto de colección pasa la validación del propio
  instalador (la misma puerta que aplica a cualquier colección).
- La sesión e2e reproduce el resultado esperado de la tarea 032 sin
  pasos manuales fuera de lo documentado.

## Procedimiento sugerido

1. Diseñar la colección de referencia (qué paquetes agrupa y con
   qué contenido) y validarla con el usuario.
2. Crear el manifiesto y los paquetes miembro.
3. Ejecutar el flujo e2e contra un destino real y registrar el
   resultado.

## Notas

- Si el repositorio propio se convierte en colección, la raíz gana
  un `teleprompter.json` con `collection: true` —decisión con
  efecto sobre cómo se instala este repo; confirmar con el usuario
  antes de adoptarla.

## Plan técnico

Diseño aprobado por el usuario (opción B con matiz): un directorio
`examples/` con dos subcarpetas — la colección que divide cada
skill de `ciclo-tareas` en su propio paquete, y la misma familia
empaquetada en un solo entregable. Su utilidad es demostrativa, no
final; son copias autocontenidas de los skills vivos.

- [x] Crear `examples/coleccion-skills/` — manifiesto de colección
  (`skills-ciclo`) con tres miembros: `crear-tareas` (con
  `personalization` para demostrar la guía por paquete),
  `ejecutar-tareas` y `commit`, cada uno instalando su skill a
  `.agents/skills/<skill>/`
  - Aporta: la colección de referencia publicable que exige la
    tarea —el ejemplo canónico del formato multi-paquete—
- [x] Crear `examples/paquete-unico/` — la misma familia como un
  solo paquete (`paquete-unico`), espejo de `ciclo-tareas`
  - Aporta: el contraste demostrativo un paquete ↔ colección
- [x] Extender `test/e2e.test.js` con la sesión e2e de colección
  contra el binario real, sobre una copia desechable de la
  colección (la fase de update muta el origen)
  - Aporta: la verificación de extremo a extremo sin pasos
    manuales y sin tocar los ejemplos del repo
- [x] Verificar que `examples/` no viaja en el paquete npm (el
  `files` de `package.json` no lo incluye)
  - Aporta: los ejemplos no alteran el artefacto publicado

## Suite de pruebas esperada

- **E2e de colección** (caso de uso principal, binario real)
  - sin selección imprime el índice de los tres miembros y aborta
    sin escribir (O)
  - `--package crear-tareas` instala solo ese miembro: skill en su
    sitio, lock con `origin.package`, guía entregada (O)
  - mutar el miembro upstream y `update` re-resuelve el mismo
    paquete a su versión nueva, conservando el `origin` (M)
- **E2e de paquete único** (caso de uso de contraste)
  - instala la familia completa de una vez con su guía (O)
- **Regresión**: el e2e de `ciclo-tareas` existente sigue en
  verde (sin letra)

## Resultado de la sesión e2e (2026-10-04)

- Índice impreso sin selección: los tres miembros con versión y
  descripción, exit 4, nada escrito.
- `--package commit --dry-run` y `--path examples/paquete-unico
  --dry-run`: planes correctos, nada escrito.
- E2e automatizado: instalación con selección, guía del miembro,
  update tras mutación upstream (2.0.0) y paquete único completo —
  suite 266/266 en verde.

## Revisión

- Subagente: 2026-10-04 — Aprueba
- Usuario: 2026-10-04 — Aprueba
