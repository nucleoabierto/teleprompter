# D014: El campo `origin` del registro

## Estado

Aceptada

## Contexto

La actualización de un paquete instalado —el plan de 019 y el
comando `update` de 020— necesita reobtener el paquete sin pedir al
usuario el origen de nuevo. El registro (D007) es la única memoria
del sistema: si la procedencia no queda persistida en él, no existe
en ninguna parte. El contrato del lock tenía que extenderse con un
campo nuevo, con forma estable porque los locks escritos ya lo
contendrán.

## Decisión

Cada entrada de paquete del registro registra su origen en el campo
`origin`: `{ "type": "github", "repo": "owner/name", "ref": "…" }`
para un origen remoto o `{ "type": "path", "path": "/abs" }` para un
origen local. `ref` aparece solo cuando el usuario la indicó —
`@ref` o `--ref`—; ausente significa la rama por defecto en el
momento de la obtención. La ruta local se registra absoluta. El
campo es opcional en la validación: las entradas escritas antes de
él siguen siendo válidas y su origen es desconocido.

## Justificación

El campo es la precondición declarada de `update`: la épica fija que
el registro es la única memoria —ninguna operación consulta el
origen por su cuenta—, así que la procedencia tenía que vivir ahí.
La forma estructurada por `type` permite reobtener sin reinterpretar
cadenas y deja espacio a orígenes futuros; el `repo` replica la
forma `owner/name` que la gramática ya exige, y el `ref` ausente
preserva la distinción «pidió esta referencia» / «usó la rama por
defecto» que `parseRepoSpec` produce. Registrar la ruta local
absoluta evita que el origen muera con el directorio de trabajo de
la invocación que instaló. Hacerlo opcional sigue el precedente de
`installedAt`: un lock escrito antes del campo no degrada a
corrupto —su origen es simplemente desconocido para `update`—.
Consecuencias: `isValidLock` exige la forma cuando el campo está
presente —una entrada con `origin` malformado se trata como el resto
del lock ilegible— y `writeLock` lo persiste como un campo más de la
entrada reescrita.

## Referencias

- `docs/tasks/018-registrar-origen-en-el-registro.md`
- `docs/decisions/D007-registro-teleprompter-lock.md`
- `docs/epics/004-ciclo-de-vida-paquete-instalado.md` — `update`
  consume el origen registrado
