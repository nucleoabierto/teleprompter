# Registrar los targets `identical` en el lock

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

El registro `teleprompter-lock.json` debe reflejar todo lo que el
paquete gestiona, no solo lo que la operación escribió. Hoy los
targets clasificados `identical` —el recurso ya existe con el mismo
contenido— no entran al registro: un `install` o `update` cuyo plan
sea todo `identical` marca el paquete como instalado sin registrar
un solo recurso. Se observó tras reinstalar factory 0.2.0 sobre
contenido idéntico: el lock quedó con solo `PERSONALIZE.md` y los
32 skills instalados quedaron desregistrados.

## Dependencias

- Ninguna

## Entrada

- `src/lock.js` — `writeLock` y la construcción de `files` a partir
  de los resultados de la ejecución.
- `src/execute.js` / `src/plan.js` — de dónde salen los resultados
  por target y la acción `identical`.
- `docs/decisions/D007` — el registro guarda los recursos
  instalados, sus acciones y sus hashes.

## Resultado esperado

- Toda entrada `identical` del plan produce su registro en `files`
  con su `sha256`, igual que las escritas.
- `check` verifica esos recursos como parte del paquete instalado.
- Prueba del caso: instalar sobre contenido idéntico registra todos
  los targets del manifiesto; cobertura 100 %.

## Criterios de calidad

- Instalar un paquete cuyos recursos ya existen con contenido
  idéntico produce un lock con todas sus entradas.
- La acción registrada es la real (`identical` u otra que el
  contrato defina), no una fingida como `create`/`overwrite`.

## Procedimiento sugerido

1. Prueba que instala sobre contenido idéntico y afirma el lock
   completo.
2. Hacer que la construcción de `files` incluya los resultados
   `identical`, decidiendo qué valor de `action` les corresponde en
   el contrato del registro.
3. Regresión: install normal, update y la escritura atómica (tarea
   022) siguen igual.

## Notas

- Defecto observado en la actualización real de factory 0.1.0 a
  0.2.0, junto al de la tarea 029; la reparación de este repo ya se
  hizo reinstalando.
- Conviene decidir el `action` registrado para `identical`
  explícitamente: `D007` guarda «las acciones» y la semántica del
  campo es contrato.

## Contexto

- `Archivos similares:`
  - `src/lock.js` — `writeLock` construye `files` a partir de las
    acciones aplicadas: `remove` se omite, `identical`/`mkdir`/`keep`
    conservan el registro previo y el resto se escribe con su
    `sha256`. Hoy un `identical` sin registro previo produce `[]`.
  - `src/execute.js` — `executePlan` emite las acciones del plan;
    `create`/`overwrite` llevan `sha256` del destino hasheado, pero
    `identical` se emite sin hash (rama final del bucle).
  - `src/cli.js` — `executeAndReport` llama a `writeLock` con las
    acciones; `showList` (línea ~199) y `showCheck` (línea ~232)
    consumen `files` filtrando solo `action === 'skip'`, así que una
    entrada `identical` se listaría y verificaría sin más cambios.
  - `test/lock.test.js` — pruebas de `writeLock`; el caso nuevo
    encaja junto a «persists the registry» y «failed write leaves
    the previous lock intact».
  - `test/cli.test.js:1021` — la prueba de la 029 documenta esta
    limitación: `files` queda `['skills/b.txt']` con un comentario
    que remite a esta tarea; la aserción cambiará al cerrar el
    defecto.
- `Patrones:` la forma del registro solo se navega desde `src/lock.js`;
  las entradas son `{target, action, sha256?}` —`skip` registra una
  omisión sin hash—; `hashPath` en `src/execute.js` hashea el
  destino tras escribirlo, y para `identical` el destino ya
  contiene el contenido del paquete por definición. Comentarios en
  inglés explicando el porqué.
- `Dominio:` `docs/domains/002-instalacion.md` — el invariante «un
  recurso `identical` conserva su registro previo pero no crea
  registro si nunca se escribió» (ancla `writeLock`) es lo que esta
  tarea cambia; el glosario de Registro (D007) lo gobierna.
- `Producto:` `manual/003-verificar-recursos-instalados.md` — los
  targets `identical` registrados pasarán a verificarse en `check`;
  el comportamiento observable cambia.
- `Lecciones:` ninguna consolidada (`docs/lessons/README.md` está
  vacío); `EXPERIENCIAS.md` guarda pendiente que la revisión
  independiente corre con `subagent_general` para poder ejecutar
  `git` y la suite.
- `Decisiones:`
  - `D007` — el lock es la memoria de propiedad: guarda los
    recursos instalados, sus acciones y sus hashes; decide que un
    `identical` registrado lleve `sha256` y una acción real.
  - `D013` — `check` verifica por recurso registrado: registrar los
    `identical` los somete a verificación.
  - `D015` — el vocabulario del plan se conserva: `identical`
    sigue siendo la marca, el cambio es qué se registra.
- `Relacionado:` la desviación registrada en la 029 —los hijos
  gobernados por un target entrante que queda `identical` o
  resuelto `skip` pierden registro— queda parcialmente cubierta al
  registrar el padre `identical`, que certifica el subárbol
  completo; el subcaso `skip` sin registro previo del padre sigue
  sin registrar los hijos.

## Conectividad

Conectada. Todo lo que la tarea asume existe en el codebase: las
entradas `identical` ya llegan a `writeLock` dentro de `actions`
—`executePlan` las emite, sin `sha256`— y la rama de `identical`
en `writeLock` es el punto de extensión exacto; `hashPath` ya está
importado en `src/lock.js` si el hash se calcula ahí, o se emite
desde `executePlan` como hacen `create`/`overwrite`. Los consumidores
de `files` —`showList` y `showCheck`— solo filtran `skip`, así que
los `identical` registrados fluyen sin tocarlos.

## Plan técnico

El subsistema es el registro del paquete: `writeLock`
(`src/lock.js`) reconstruye `files` a partir de las acciones
aplicadas —`identical`/`mkdir`/`keep` solo conservan el registro
previo, así que un `identical` nunca escrito produce `[]`—.
`executePlan` (`src/execute.js`) ya emite las acciones `identical`
pero sin `sha256` —solo `create`/`overwrite` hashean el destino—.
Los consumidores de `files` —`showList`, `showCheck` y el plan de
actualización— solo filtran `skip`: basta con que la entrada
exista para que el recurso quede gestionado.

Decisión transversal: un `identical` sin registro previo se
registra como `{target, action: 'identical', sha256}` —la acción
real que el criterio de calidad exige (D007) y el hash del destino,
cuyo contenido el plan ya probó igual al del paquete—. Un
`identical` con registro previo conserva su entrada anterior —su
acción original y su hash—: la procedencia se preserva.

- [x] Prueba de reproducción por el CLI: instalar sobre contenido
  idéntico registra todos los targets del manifiesto con su hash
  —hoy `files` queda vacío
  - Aporta: fija el defecto observado en la actualización real de
    factory antes de tocar el registro
  - Contexto: el fixture `installed` de `test/cli.test.js` instala
    una versión 1 con `--path`; instalar el mismo paquete otra vez
    produce un plan todo `identical`
- [x] `executePlan` emite `sha256` en las acciones `identical`
  —hash del destino, como hacen `create`/`overwrite`
  - Aporta: la acción aplicada queda autocontenida y `writeLock`
    sigue siendo un mapeador de forma, sin conocer el disco
  - Contexto: el contenido del destino está certificado por el plan;
    un fallo de hash degradaría a `ExecutionError` como cualquier
    otra acción
- [x] `writeLock` registra un `identical` sin registro previo como
  `{target, action: 'identical', sha256}`; con previo conserva la
  entrada anterior
  - Aporta: cierra el agujero —todo lo que el paquete gestiona
    queda en la memoria de propiedad (D007)—
  - Contexto: la rama `identical`/`mkdir`/`keep` ya existe; solo
    `identical` cambia de política, `mkdir` y `keep` no —`mkdir`
    es contabilidad del plan y `keep` conserva lo decidido
- [x] Actualizar la aserción del lock en la prueba del CLI de la
  029 —el hijo `identical` pasa a registrarse— y `npm test` al
  100 % de líneas, ramas y funciones
  - Aporta: la desviación documentada de la 029 queda resuelta y la
    suite certifica el cambio
  - Contexto: la prueba «update keeps incoming children when the
    map moves from a directory to per-child targets»
    (`test/cli.test.js`) aserta `files` y lleva un comentario que
    remite a esta tarea

## Suite de pruebas esperada

- Un recurso `identical` sin registro previo entra en `files` con
  `action: 'identical'` y su `sha256`: instalar sobre contenido
  idéntico registra el manifiesto completo. (O)
- Un plan todo-`identical` sobre un paquete nunca instalado produce
  una entrada con todos sus `files` —el caso factory observado, que
  marcaba el paquete instalado con `files` vacío—. (Z)
- Varios `identical` mezclados con escrituras registran cada uno su
  marca y su hash, en el orden del plan. (M)
- Un `identical` con registro previo conserva la entrada anterior:
  su `action` original y su hash, sin duplicar. (B)
- `check` y `list` cubren los `identical` registrados: tras
  instalar sobre contenido idéntico, `check` los verifica intactos
  y `list` los muestra. (I)
- El update de la 029 registra los hijos `identical`: la aserción
  del lock pasa de `['skills/b.txt']` a ambos hijos. (I)
- Regresión: `remove`, `mkdir`, `keep` y `skip` construyen `files`
  igual que antes, y un `identical` sigue reportándose como
  `identical` en la salida.

## Notas

- Caso límite detectado en revisión: un `identical` cuyo registro
  previo es `skip` conserva la entrada `skip` —sin hash y fuera de
  `check`/`list`— aunque el recurso ya resulta igual al paquete.
  Es la lectura literal de la decisión «con previo conserva la
  entrada anterior»: el `skip` registró que la herramienta nunca
  escribió ahí. Queda como comportamiento conocido, no cubierto
  por esta tarea.
- Consecuencia señalada por la revisión final: un `identical`
  registrado entra en el filtro de retirados —una versión futura
  que deje de enviar ese target lo retirará intacto—, así que la
  herramienta puede eliminar un fichero que nunca escribió. Es la
  lectura literal del invariante adoptado —el paquete lo gestiona
  lo escribiera quien lo escribiera—, no un defecto, y queda
  constancia de que el retirado amplía su alcance destructivo.

## Desviaciones del plan

- La prueba de reproducción no usa el fixture `installed` —que ya
  registra los targets al instalar— sino contenido idéntico escrito
  a mano sin registro previo: el plan resultante es el mismo
  todo-`identical` del defecto observado, pero con `files` vacío
  garantizado, que es lo que la prueba fija. Motivo: con registro
  previo el `identical` lo conserva y el defecto no se reproduce.
  Decisión: equivalente y más directo; el resto del plan no cambia.
- La conservación del registro previo quedó acotada a lo que sigue
  siendo veraz —una omisión `skip` o un hash que coincide—: un
  registro previo cuyo hash el disco desmiente se reemplaza por la
  entrada `identical` real. Motivo: la revisión detectó que
  conservarlo ciegamente perpetuaba un hash falso —`check` marcaría
  `modificado` un recurso que el paquete gestiona—. Decisión:
  misma política, acotada a registros veraces; la suite cubre los
  tres casos del previo.

## Revisión

- Subagente: 2026-10-03 — Aprueba
- Usuario: 2026-10-03 — Aprueba
