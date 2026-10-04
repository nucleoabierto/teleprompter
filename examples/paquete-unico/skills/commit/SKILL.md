---
name: commit
description: >
  Crea un commit en Git siguiendo las mejores prácticas: mensaje con asunto
  en voz imperativa, máximo 50 caracteres, cuerpo que explica el qué y
  el porqué,
  commits atómicos y convenciones del proyecto.
  Usar cuando se pida explícita o implícitamente realizar un commit: al
  terminar una tarea, al completar un cambio lógico, o cuando el usuario
  solicita commitear.
  Sinónimos: commitear, hacer un commit, guardar cambios, confirmar cambios.
---

# Commit

Instrucciones para que un agente cree un commit en Git siguiendo las mejores prácticas de mensajes y atomicidad.

## Cuándo usar

Cuando se pida explícita o implícitamente realizar un commit:

- Al terminar una tarea o cambio lógico.
- Cuando el usuario solicita commitear.
- Cuando un conjunto de cambios forma una unidad coherente y está listo para registrarse.

## Cuándo no usar

- Cuando hay cambios sin relación lógica entre sí: dividir en commits separados antes de commitear.
- Cuando el usuario pide explícitamente no commitear.
- Cuando no hay cambios que commitear.

## Entrada

- Cambios sin commitear en el repositorio actual (staged o unstaged).
- Opcionalmente, un mensaje de commit proporcionado por el usuario. Si no se proporciona, el agente lo redacta.

## Salida

Un commit creado en el repositorio, con un mensaje que cumple las siete reglas y las convenciones del proyecto.

## Principios rectores

1. **Commits atómicos:** un commit hace una sola cosa. Si hay cambios no relacionados, dividir en commits separados.
2. **Mensaje claro:** el asunto resume el cambio; el cuerpo explica el *qué* y el *porqué*, no el contenido. El diff ya muestra el contenido; el cuerpo debe aportar el contexto que el diff no revela.
3. **Contexto explícito:** toda referencia a artefactos del proyecto —decisiones, tareas, propuestas, convenciones internas— debe ser autodescriptiva o ir acompañada de una referencia resoluble (ruta o descripción). El mensaje debe ser comprensible para un lector que solo tiene el historial de git.
4. **Convenciones del proyecto:** detectar y seguir las convenciones existentes antes de aplicar las reglas universales.
5. **Mínima invención:** no inventar convenciones. Si no hay, aplicar las siete reglas universales.

## Las siete reglas

1. Separar asunto y cuerpo con una línea en blanco.
2. Limitar el asunto a 50 caracteres.
3. Escribir el asunto con mayúscula inicial.
4. No terminar el asunto con punto.
5. Usar voz imperativa en el asunto.
6. Envolver el cuerpo a 72 caracteres.
7. Usar el cuerpo para explicar el *qué* y el *porqué*, no el contenido. El *qué* es la decisión o acción que se tomó; el *porqué* es la motivación. El contenido —archivos modificados, secciones creadas, detalle técnico— es visible en el diff y no debe repetirse en el cuerpo. El cuerpo expone el razonamiento del cambio, no el proceso que lo produjo: no narra el flujo de trabajo, la sesión ni los pasos seguidos.

## Procedimiento

1. **Verificar que hay cambios** sin commitear con `git status`. Si no hay, informar al usuario y terminar.
2. **Detectar las convenciones del proyecto** examinando el historial reciente con `git log --oneline -20`. Identificar: uso de Conventional Commits, tipos permitidos, prefijos de ámbito, referencias a issues, firmas, idioma.
3. **Evaluar la atomicidad** de los cambios con `git diff` y `git diff --staged`. Si hay cambios no relacionados, dividirlos en commits separados. Cada commit debe ser un cambio lógico único. La división se ejecuta iterativamente: se prepara y commitea cada grupo de cambios relacionados por separado, repitiendo desde el paso 4 hasta agotar todos los grupos.
4. **Preparar los cambios** correspondientes al commit actual con `git add`, añadiendo solo los archivos relacionados.
5. **Redactar el mensaje:**
   - Asunto: voz imperativa, máximo 50 caracteres, con mayúscula inicial, sin punto final.
   - Cuerpo (si el cambio lo justifica): explicar el *qué* y el *porqué* del cambio, envuelto a 72 caracteres. El *qué* es la decisión o acción; el *porqué* es la motivación. No describir el contenido (el diff ya lo muestra) ni narrar el proceso que produjo el cambio. Si se mencionan artefactos del proyecto —decisiones, tareas, propuestas—, la referencia debe ser autodescriptiva o resoluble desde el propio mensaje.
   - Aplicar las convenciones detectadas en el paso 2.
   - Si el usuario proporcionó un mensaje, usarlo como base y ajustarlo a las reglas si es necesario.
6. **Crear el commit** con `git commit`. Usar heredoc para mensajes con cuerpo:
   ```
   git commit -m "$(cat <<'EOF'
   Asunto del commit

   Cuerpo del commit que explica el qué y el porqué.
   EOF
   )"
   ```
7. **Verificar el resultado** con `git log -1` y `git status`.
8. **Si quedan cambios sin commitear** que formen unidades lógicas distintas, repetir desde el paso 4.

## Finalización

El skill ha terminado cuando:

- Se han commiteado todos los cambios relacionados.
- El mensaje cumple las siete reglas y las convenciones del proyecto.
- No quedan cambios sin commitear que pertenezcan al mismo cambio lógico.

Para el detalle de Conventional Commits, tipos, casos especiales y convenciones del proyecto, leer `references/convenciones.md`.
