# Comentarios y mensajes de commit autocontenidos

Escribe comentarios de código y mensajes de commit autocontenidos: el lector futuro del código o del historial de git no debe necesitar acceso a la documentación del proyecto para entender el porqué de una decisión. El contexto del ticket es efímero; el código es duradero.

## Principios

- **Incorporar el contexto**: cada comentario contiene la información necesaria para entenderse por sí mismo. Explica el porqué directamente en el comentario en lugar de remitir a tickets, ADRs, PRDs, epics u otra documentación externa.
- **Evitar referencias a artefactos del workflow**: no escribas `ver T1`, `según ADR-002`, `como define el TRD`. El comentario debe sobrevivir aunque esa documentación desaparezca.
- **Mensajes de commit autocontenidos**: describe el cambio y su motivación en términos autocontenidos, sin mencionar el ticket ni la tarea que los originó.

## Ejemplos

Comentario autocontenido (correcto):

```python
# El cache de sesión se invalida en logout para evitar reuso de tokens
# en dispositivos compartidos.
def invalidate_session(user_id: str) -> None:
    ...
```

Comentario con referencia efímera (evitar):

```python
# Ver T1 para el contexto de invalidación de sesión.
```

## TODO/FIXME

Los marcadores `TODO` y `FIXME` también deben ser autocontenidos: el lector futuro debe entender qué quedó pendiente y por qué sin buscar un ticket, ADR u otra documentación externa. El ticket es efímero; el marcador vive en el código.

- **Incorporar el contexto**: describe qué falta, por qué queda pendiente y qué debería hacerse. No escribas `# TODO: ver T1` ni `# TODO: fix this`.
- **Evitar referencias a artefactos del workflow**: no escribas `# TODO: (ticket #ALE-042)` ni `# FIXME: según ADR-002`. Si quieres conservar la trazabilidad, el contexto explicativo debe bastar por sí mismo; la referencia al ticket es opcional y nunca sustituye a la descripción.

TODO autocontenido (correcto):

```python
# TODO: Implementar invalidación de cache por TTL. Actualmente el cache
# nunca expira, por lo que se sirve data stale indefinidamente. Agregar
# expiración de 5 minutos para que las entradas se refresquen.
def calculate_expensive_value():
    ...
```

TODO con referencia efímera (evitar):

```python
# TODO: Cache invalidation strategy (ticket #ALE-042)
# Remove when ALE-042 is implemented
```

FIXME autocontenido (correcto):

```python
# FIXME: El parser asume que el timestamp siempre viene en UTC. Cuando
# llega en hora local, el offset se aplica dos veces y el evento queda
# desplazado. Normalizar a UTC antes de calcular el offset.
def parse_event(raw):
    ...
```

FIXME sin contexto (evitar):

```python
# FIXME: hack
data = hack_data()
```

## Aplicación

- **Al generar código o commits**: redacta comentarios y mensajes de commit que se sostengan por sí mismos. Si una decisión necesita contexto, inclúyelo en el comentario o mensaje; no remitas a artefactos del workflow.
- **Al revisar código o commits**: marca como hallazgo los comentarios o mensajes de commit que dependan de referencias efímeras a artefactos del workflow (tickets, ADRs, PRDs, epics, TRDs). El código y el historial deben ser legibles sin esa documentación.
