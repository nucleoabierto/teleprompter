# Qué es una decisión de diseño

Una decisión de diseño es una elección justificada que da forma al proyecto y que es costosa de revertir. Define una regla o un principio que orienta decisiones futuras. Responde a la pregunta: ¿por qué este sistema tiene esta forma?

Son decisiones de diseño:

- Elegir `TODO.txt` como índice único de tareas frente a un gestor externo.
- Adoptar el estándar Agent Skills para todos los skills del proyecto.
- Mantener un commit por tarea completada.

No son decisiones de diseño:

- El registro de una tarea completada (vive en `TODO.txt` y en el archivo de tarea).
- La descripción de cómo se implementó algo (vive en el commit y en el código).
- Un documento de visión o un README (describen el proyecto, no justifican una elección concreta).
- Una regla operativa permanente (vive en `AGENTS.md`).

La distinción clave es la **inmutabilidad relativa**: una decisión de diseño se escribe una vez y se mantiene salvo que una decisión posterior la revoque o la sustituya.
