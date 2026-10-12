# Revisión técnica con subagente

## Lecciones

- **Lanzar la revisión técnica independiente con un subagente que
  pueda ejecutar comandos.** Un revisor con perfil de solo lectura
  no puede reconstruir el diff con git ni correr la suite:
  reconstruye el «diff» leyendo los archivos modificados y la
  revisión pierde su evidencia —la lectura directa no sustituye al
  diff real ni a la ejecución de las pruebas—.
  Disparadores: `revisar-implementacion`, subagente, revisión
  técnica, `git diff`, `git status`, suite de pruebas, `npm test`,
  pull request
  Origen: 20260930T010326
