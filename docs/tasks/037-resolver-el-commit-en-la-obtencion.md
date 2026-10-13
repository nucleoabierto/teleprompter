# Resolver el commit exacto en la obtención remota

## Estado

**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

La obtención remota devuelve, junto al contenido descargado, el
commit exacto que resolvió la referencia pedida —un SHA de 40
caracteres— tanto cuando la ref viene explícita como cuando está
ausente y se sirve la rama por defecto.

## Dependencias

- Ninguna.

## Entrada

- `src/fetch.js` endurecido (timeouts por endpoint, límite de
  descarga, diagnósticos HTTP diferenciados) y sus consumidores en
  `src/cli.js`.
- El sondeo de la propuesta: el SHA se obtiene de
  `api.github.com/repos/{o}/{r}/commits/{ref}`; sin `ref`, el mismo
  endpoint sobre la rama por defecto (obtenible del repo o del
  redirect del tarball, que expone `refs/heads/<rama>`).

## Resultado esperado

- El resultado de la obtención remota lleva el SHA resuelto
  disponible para quien la invoca.
- La resolución corre bajo los mismos presupuestos y diagnósticos
  del fetch endurecido: timeout propio y errores específicos.
- Cuando la ref ya es un SHA completo, no se repite la resolución:
  el dato se devuelve tal cual.

## Criterios de calidad

- `user/repo` sin ref resuelve el SHA real de la rama por defecto
  en ese momento (verificable contra la API de GitHub).
- `user/repo@<ref>` resuelve el SHA de esa ref —rama, tag o
  prefijo— y `user/repo@<sha-completo>` no dispara la resolución.
- Una ref inexistente produce el diagnóstico «no encontrado», no un
  error genérico.
- La suite cubre los caminos nuevos y la cobertura sigue al 100 %.

## Procedimiento sugerido

1. Localizar el punto del fetch donde la ref se traduce a URL de
   descarga y decidir dónde encaja la llamada de resolución: antes
   de la descarga, compartiendo sus presupuestos.
2. Implementar la resolución ref → SHA contra el endpoint de
   commits, con su timeout y sus diagnósticos; reconocer el SHA
   completo como resuelto sin llamada.
3. Propagar el SHA en el resultado de la obtención hasta el
   consumidor, sin registrar nada todavía.
4. Cubrir con tests los casos: sin ref, ref concreta, SHA completo,
   ref inexistente y fallo de la llamada de resolución.

## Notas

- La resolución añade una llamada a la API de GitHub por obtención;
  quienes instalen muchos paquetes en ráfaga comparten el límite de
  peticiones, ya diagnosticado como «acceso denegado o límite».

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
