# El retirado de un directorio padre destruye los targets hijos entrantes

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Cuando el mapa de instalación cambia de granularidad —un target
directorio registrado (`.agents/skills/` en factory 0.1.0) pasa a
declararse por hijos (`.agents/skills/<nombre>` en 0.2.0)— el plan
de actualización no debe retirar el árbol completo: los hijos
entrantes siguen gestionados. Hoy `buildUpdatePlan` clasificó el
directorio como `retire` intacto y la ejecución lo borró entero,
eliminando 32 skills que el propio plan acababa de marcar
`identical`. Es pérdida de datos silenciosa, observada en la
actualización real de factory 0.1.0 a 0.2.0.

## Dependencias

- Ninguna

## Entrada

- `src/plan.js` — `buildUpdatePlan`: clasificación de retirados por
  comparación entre targets registrados y targets entrantes.
- `src/execute.js` — ejecución de la acción `retire`/`remove`.
- `docs/decisions/D015` — solo se eliminan retirados intactos; los
  que derivaron exigen decisión.
- Reproducción real: teleprompter-lock de factory 0.1.0 (una entrada
  `.agents/skills/`) contra el manifiesto 0.2.0 (32 entradas
  `.agents/skills/<nombre>`).

## Resultado esperado

- Un target registrado que es ancestro de targets entrantes no se
  retira completo: la comparación desciende a los recursos, y solo
  se elimina lo que el mapa nuevo realmente abandonó.
- El caso inverso queda decidido también: hijos registrados que
  colapsan a un directorio padre entrante.
- Pruebas que fijan ambos comportamientos; cobertura 100 %.

## Criterios de calidad

- Reproducción del escenario real: registro con target directorio y
  mapa entrante por hijos → tras `update`, los archivos de los
  hijos entrantes siguen en disco y registrados.
- Un hijo presente en el mapa viejo y ausente en el nuevo sí se
  retira según las reglas vigentes (intacto → borrado, deriva →
  decisión).
- Coherencia con D015 y con la defensa de rutas registradas.

## Procedimiento sugerido

1. Escribir la prueba que reproduce el escenario factory 0.1→0.2.
2. Ajustar la clasificación de retirados: expandir el target
   directorio registrado a sus recursos antes de comparar, o
   excluir del retiro todo lo cubierto por targets entrantes.
3. Verificar el caso simétrico (hijos registrados → padre entrante)
   y la regresión de retirados normales.

## Notas

- El daño ya ocurrió en este repo y se reparó reinstalando; la
  tarea corrige la causa.
- Relacionada con la 030 —el registro omite los `identical`— pero
  son defectos independientes.

## Contexto

- Archivos similares:
  - `src/plan.js` — `buildUpdatePlan` compara targets registrados
    contra targets entrantes por igualdad de ruta normalizada
    (`shipped.has(...)`); un directorio registrado cuyos hijos sí se
    declaran entra como `retire` y la ejecución lo borra entero.
  - `src/execute.js` — `executePlan` procesa `resources` antes que
    `retired` y la acción `remove` usa `fs.rmSync` recursivo: un
    directorio retirado se lleva a los hijos que el plan acababa de
    escribir o confirmar `identical`.
  - `src/drift.js` — `classifyResource` da la deriva por entrada
    registrada (`intact`/`modified`/`missing`/`unverifiable`); es la
    vía para clasificar a nivel de recurso individual.
  - `test/plan.test.js` — fixture `destWithLock` fabrica registro y
    disco; la sección «El plan de actualización» es el modelo a
    seguir para las pruebas nuevas.
  - `test/e2e.test.js` — instala el paquete de referencia por el
    binario real; modelo para la reproducción extremo a extremo.
- Patrones:
  - Comentario narrativo sobre cada exportación explicando el «por
    qué», no el «qué»; marcas del plan en inglés (`create`,
    `identical`, `update`, `conflict`, `retire`, `removal`).
  - Comparaciones de targets siempre normalizadas con
    `path.normalize` (ver el comentario sobre `./a.txt`).
  - Toda escritura y borrado revalida la cadena de padres con
    `resolvesUnder`/`recordedChainSafe` —el lock es dato no
    confiable y se revalida antes de usarlo.
  - Pruebas con `node:test`, directorios temporales en
    `os.tmpdir()`, cobertura obligatoria del 100 % en líneas,
    funciones y ramas (`npm test`).
- Dominio:
  - `docs/domains/002-instalacion.md` — el plan de actualización,
    la política de retirados (solo intactos se eliminan solos) y la
    invariante de que ninguna escritura sale de la raíz; la sección
    «Registro (lock)» documenta que los `identical` conservan
    registro previo.
- Producto:
  - `manual/referencia-update.md` y
    `manual/004-actualizar-un-paquete.md` — describen `retire` como
    «la versión retira un recurso intacto»; el cambio precisa qué
    cuenta como recurso retirado cuando cambia la granularidad del
    mapa.
- Lecciones: ninguna aplica —`docs/lessons/README.md` declara «sin
  lecciones todavía». Hay una experiencia pendiente en
  `EXPERIENCIAS.md`: la revisión técnica independiente debe lanzarse
  con el perfil `subagent_general` para poder ejecutar `git` y la
  suite; aplicar al llegar a la revisión.
- Decisiones:
  - D015 — política de retirados: intacto → `retire`, deriva →
    `conflict` con `removal` (`overwrite` quita, `skip` conserva),
    ausente → desaparece del plan; el cambio desciende la comparación
    a recursos pero conserva esta política.
  - D005 — plan completo antes de escribir: la expansión a recursos
    ocurre al construir el plan, no durante la ejecución.
  - D013 — la deriva por recurso es `classifyResource`; reutilizarla
    en lugar de reinventar la comparación.

## Conectividad

Conectada.

Todo lo que la tarea asume existe: `buildUpdatePlan` (`src/plan.js`)
clasifica los retirados comparando el `target` registrado contra el
conjunto `shipped` por igualdad de ruta normalizada —el punto exacto
del defecto—, `classifyResource` (`src/drift.js`) ya clasifica la
deriva por entrada y `executePlan` (`src/execute.js`) ejecuta
`remove` con `rmSync` recursivo. El lock registra un `target`
directorio como una sola entrada con el hash del árbol
(`hashPath`), así que el escenario factory 0.1.0→0.2.0 es
reproducible con los fixtures existentes (`destWithLock`,
`pkgWith`). Lo único inexistente —un recorrido de los contenidos de
un target directorio registrado para comparar a nivel de recurso—
es absorbible dentro de la propia tarea.

## Plan técnico

`buildUpdatePlan` (`src/plan.js`) clasifica cada recurso entrante
contra el destino y el registro, y después deriva los retirados
comparando los targets registrados con el conjunto `shipped` por
igualdad de ruta normalizada. La ejecución (`src/execute.js`) aplica
`remove` recursivo sin saber qué cubre la ruta. El defecto vive en
esa comparación de igualdad: cuando la granularidad del mapa cambia,
la rutina no desciende a los recursos. El cambio se concentra en
`src/plan.js`, con un predicado de jerarquía en `src/paths.js` y la
enumeración del contenido registrado junto a la deriva;
`execute.js` no cambia porque las unidades de retiro que recibe ya
son correctas.

Decisiones transversales: D015 se conserva por unidad —intacto →
`retire`, deriva → `conflict` `removal`, ausente → desaparece del
plan—. La clave que permite bajar la comparación sin hashes por
hijo en el lock es la certificación: un árbol registrado intacto
garantiza que todo descendiente tiene el contenido anotado, así
que su hash actual vale como hash registrado.

- [x] Escribir la prueba de reproducción por el CLI: instalar una
  v1 con target `skills/` y actualizar a una v2 que declara
  `skills/a` y `skills/b`; los hijos quedan en disco.
  - Aporta: fija el defecto antes de tocar la clasificación; es el
    escenario factory 0.1→0.2 del objetivo.
  - Contexto: el fixture `installed(manifest, files)` de
    `test/cli.test.js` ya instala una v1 con origen `--path`
    registrado y deja el destino listo para `update`.
- [x] Añadir a `src/paths.js` un predicado de jerarquía entre
  targets relativos (ancestro o descendiente estricto).
  - Aporta: la comparación por igualdad pasa a comparación por
    cobertura, decidida en un solo lugar.
  - Contexto: los targets directorio llevan separador final
    (`.agents/skills/`) y `path.normalize` lo conserva, así que la
    comparación por prefijo de cadena falla; hay que comparar por
    segmentos o recortar el separador antes.
- [x] Enumerar el contenido de un target registrado que es
  directorio en disco: recorrido que produce las unidades máximas
  no cubiertas por targets entrantes.
  - Aporta: convierte «el directorio registrado» en los recursos
    concretos que el mapa nuevo abandonó —los candidatos reales a
    retirar—.
  - Contexto: el descenso se detiene al entrar en un target
    entrante (cubierto), en una entrada registrada propia (la
    clasifica su propia entrada) o en la unidad misma. Si la ruta
    no es un directorio legible no hay unidades y la entrada sigue
    el camino clásico. `src/plan.js` no importa `fs` hoy: el
    recorrido encaja en `src/drift.js`, cuyo dominio es confrontar
    lo registrado con el disco.
- [x] Repartir en `buildUpdatePlan` las entradas registradas no
  enviadas: descendientes de un target entrante salen del retiro
  —las gobierna la acción de su recurso—, ancestros se expanden a
  unidades y el resto sigue el camino clásico.
  - Aporta: cubre los dos sentidos del cambio de granularidad y
    mantiene la política de retirados por unidad.
  - Contexto: una unidad solo es `retire` cuando el árbol
    registrado clasifica `intact`; en cualquier otro caso la
    unidad es no verificable y degrada a `conflict` `removal`.
- [x] Certificar los hijos entrantes: un target entrante dentro de
  un árbol registrado intacto usa su hash actual como hash
  registrado efectivo.
  - Aporta: el hijo que la versión cambió clasifica `update` en
    vez de `conflict` —sigue gestionado— y el intacto sigue
    `identical`.
  - Contexto: si el usuario tocó un hijo el árbol ya no es
    intacto, no hay certificación y clasifica `conflict`: la
    degradación conservadora se conserva. La deriva del ancestro
    se calcula una vez por árbol, no por hijo.
- [x] Añadir los casos de la suite a `test/plan.test.js` y
  `test/cli.test.js` y verificar `npm test` con cobertura al
  100 %.
  - Aporta: fija los dos sentidos del cambio y la regresión de los
    retirados clásicos.

## Suite de pruebas esperada

Caso de uso A — el mapa pasa de directorio registrado a hijos
entrantes (el defecto observado):

- Por el CLI: instalar una versión con target `skills/` y
  actualizar a otra que declara `skills/a` y `skills/b` deja los
  hijos en disco tras el `update`; el plan no retira `skills/` y
  el registro queda a la versión nueva. (I)
- Plan: un hijo cubierto intacto es `identical` y el directorio
  registrado no aparece en `retired` ni en `conflicts`. (O)
- Plan: un hijo cubierto que la versión cambió es `update`, no
  `conflict`, porque el árbol registrado intacto certifica la
  propiedad. (O)
- Plan: varios hijos cubiertos —idénticos y cambiados— reciben
  cada uno su marca sin que el padre se retire. (M)
- Plan: todo el contenido del árbol registrado queda cubierto →
  `retired` sale vacío. (Z)
- Plan: un hermano no cubierto bajo un árbol intacto entra como
  `retire` en unidad máxima —el subdirectorio con su contenido, no
  el padre—. (B)
- Plan: con el árbol registrado modificado, los hijos cubiertos
  son `conflict` y las unidades no cubiertas `conflict` `removal`;
  ningún retiro es automático. (E)
- Plan: con el directorio registrado ausente del disco, los hijos
  entrantes son `create` y no hay nada que retirar. (B)
- Plan: si el target registrado ya no es directorio —un archivo
  ocupa su ruta— la entrada sigue el camino clásico (`conflict`
  `removal`) y los hijos entrantes no clasifican seguros: sin
  consola el plan aborta sin escribir. (E)
- Plan: una entrada registrada propia dentro del árbol expandido
  produce una única unidad de retiro, clasificada con su propia
  deriva. (B)

Caso de uso B — el mapa pasa de hijos registrados a un directorio
entrante:

- Plan: hijos registrados y target entrante directorio con el
  mismo contenido → `identical`, sin retiros por los hijos. (O)
- Plan: el mismo escenario con contenido entrante distinto → el
  directorio es `conflict` —no hay hash registrado a esa
  granularidad— y los hijos no generan retiro. (B)
- Por el CLI: resolver `overwrite` sobre el directorio reemplaza
  el subárbol completo; los hijos registrados desaparecen con él,
  sin borrados duplicados. (I)

Caso de uso C — regresión de retirados clásicos:

- Plan: un retirado clásico —archivo registrado que la versión ya
  no trae— coexiste con la expansión en el mismo plan y clasifica
  como antes: `retire` intacto, `conflict` `removal` con deriva.

## Desviaciones del plan

- El criterio «los hijos entrantes siguen en disco y registrados»
  se cumple para los hijos gestionados (`update`), pero los
  `identical` quedan en disco sin registro: `writeLock` conserva un
  `identical` solo si hay registro previo del mismo target, y el
  registro viejo solo anotaba el directorio padre. Motivo: la raíz
  es el defecto independiente de la tarea 030 —el registro omite
  los `identical`—, no esta tarea. Decisión: la prueba del CLI
  aserta el estado real del lock (`files` = `['skills/b.txt']`,
  solo el hijo actualizado) con un comentario que remite a la 030,
  que cubrirá el registro completo.
- Caso análogo descubierto en revisión: los hijos registrados
  gobernados por un target entrante directorio pierden su registro
  cuando el padre queda `identical` o resuelto `skip` —el lock solo
  escribe lo que el plan ejecuta—. Misma raíz y misma decisión:
  queda delegado a la 030; el efecto es conservador —el siguiente
  `update` los clasifica `conflict`, nunca los borra—.

## Notas

- Caso borde detectado en la revisión final: con un lock fabricado
  —entradas registradas anidadas, que el manifiesto prohíbe y
  `writeLock` no produce— un symlink conservado que conduce a una
  entrada registrada no ancla la expansión, y el orden de `retired`
  puede dejar un plan no ejecutable —un retiro cuelga el enlace y
  la eliminación posterior aborta con `ExecutionError`, quedando el
  reintento enclavado hasta limpieza manual—. Falla ruidosa y
  conservadora, sin pérdida silenciosa; el revisor la estima menor
  y sugiere como salida ordenar los retiros por profundidad
  descendente o anclar también los enlaces que conducen a
  registrados. Candidata a tarea de seguimiento.

## Revisión

- Subagente: 2026-10-03 — Aprueba
- Usuario: 2026-10-03 — Aprueba
