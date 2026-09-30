# Entrega de guía post-instalación en herramientas comparables

> **Fecha:** 2026-09

## Propósito

Determinar cómo las herramientas comparables entregan al destinatario
las instrucciones de adaptación tras instalar —cómo las presentan al
terminar y cómo se consultan después—, para alimentar la entrega de la
guía de personalización de Teleprompter (tarea 013, épica 003). La
declaración ya está fijada por la propuesta: un campo del manifiesto
que apunta a un archivo de texto libre.

## Contexto

La propuesta `docs/proposals/003-personalizacion-guiada/` decide que
la guía se declara con un campo del manifiesto que apunta a un
archivo de texto libre, sin formato impuesto ni contenido
ejecutable, y que el instalador la entrega al final de la
instalación con consulta posterior. La restricción propia del
producto: el origen remoto se descarga a un temporal que se elimina
al terminar, así que la guía debe materializarse en el destino para
ser consultable después.

## Análisis

### Presentación al terminar la instalación

- **Homebrew — `caveats`:** la fórmula declara un bloque de texto
  libre; `brew install` lo recoge durante la instalación y lo muestra
  una sola vez al final, bajo el encabezado `==> Caveats`, tras la
  limpieza y antes del resumen. Solo aparece para fórmulas instaladas
  a petición —no para dependencias— y se omite en modo silencioso
  [1][2][5].
- **copier — `_message_after_copy`:** la plantilla declara un mensaje
  de texto libre que se imprime solo si la copia terminó con éxito;
  puede importarse desde un archivo con un `include` de Jinja, y se
  suprime en modo silencioso. Hay variantes `_message_before_copy` y
  `_message_after_update` [3].
- **RubyGems — `post_install_message`:** campo de texto libre del
  gemspec que `gem install` imprime al final, salvo que se desactive
  con la opción `--no-post-install-message` de `gem install` [4].
- **VS Code — `contributes.walkthroughs`:** el `package.json` de la
  extensión declara punteros a archivos markdown/media que se
  empaquetan dentro de ella; tras la instalación aparecen en la
  página de bienvenida [6].

### Consulta posterior

- **Homebrew:** `brew info <fórmula>` vuelve a mostrar los caveats —y
  también `--json`—; el contenido se reevalúa desde la fórmula, que
  Homebrew conserva en local [5]. Matiz: los caveats se muestran
  incluso para fórmulas no instaladas, lo que ha generado confusión
  documentada [7].
- **VS Code:** el contenido del walkthrough vive dentro de la
  extensión instalada, así que se consulta siempre desde el propio
  destino (página «Get Started») sin descargar nada [6].
- **RubyGems:** el gemspec instalado persiste en el directorio
  `specifications/` del gem home, y `gem specification <gema>
  post_install_message` devuelve el mensaje tras la instalación —
  encaja en el modelo (b): la guía vive en la fuente conservada en
  local y se relee bajo demanda [4].
- **copier:** el mensaje es efímero —se imprime en la instalación y
  no queda consultable; el archivo de respuestas guarda respuestas,
  no el mensaje [3].

### Materialización

Dos modelos: (a) la guía viaja dentro de lo instalado y queda
consultable localmente (VS Code); (b) la guía vive en la fuente y se
relee bajo demanda (Homebrew, posible porque conserva las fórmulas).
Para Teleprompter, (b) no aplica tal cual: el origen remoto es un
temporal que se elimina, así que la guía debe materializarse en el
destino.

## Recomendación

1. **Entrega diferida al final del resultado exitoso**, bajo un
   encabezado propio y con el contenido del archivo tal cual —modelo
   caveats/`message_after_copy`—. Sin salida extra si el paquete no
   declara guía, y nada en `--dry-run` ni en instalaciones fallidas.
2. **El archivo de instrucciones se instala como recurso en el
   destino**, registrado en `teleprompter-lock.json`: la guía forma
   parte de la carga útil (modelo VS Code) y el registro la recuerda
   (modelo del lock, precedente de la base de dpkg y de
   `.copier-answers.yml`). Es lo que hace la consulta posterior
   posible sin redescargar el paquete, y no reproduce la alternativa
   descartada en la propuesta —la guía como recurso anónimo— porque
   el manifiesto la declara distinguida y el instalador la entrega.
3. **La consulta posterior lee el archivo materializado en el
   destino** —no el registro, que solo necesita recordar la ruta—,
   mediante una invocación del CLI que la tarea 015 fija.

## Limitaciones

- npm, citado en la tarea como ejemplo, no aporta patrón aplicable:
  `postinstall` ejecuta código arbitrario —fuera del modelo
  declarativo— y `funding` no es guía del mantenedor.
- No se encuestaron instaladores de skills de agentes más allá de
  skills.sh —que no declara guía post-instalación— ni herramientas
  con guía interactiva.
- Los detalles de comportamiento —supresión en silencio, orden
  diferido— provienen del código y la documentación de cada
  herramienta, consultados en 2026-09.

## Referencias

- [1] Homebrew, `formula_installer.rb` y `caveats.rb` —
  github.com/Homebrew/brew
- [2] Homebrew, «Formula Cookbook», sección Caveats —
  docs.brew.sh/Formula-Cookbook
- [3] copier, «Configuring» — `message_after_copy`,
  `message_before_copy`, `message_after_update` —
  copier.readthedocs.io/en/stable/configuring/
- [4] RubyGems, «Specification Reference», `post_install_message` —
  guides.rubygems.org/specification-reference/
- [5] Stack Overflow, «Redisplay brew Post Installation Text» y
  «How do I "replay" the "Caveats" section» —
  stackoverflow.com/q/42309296 y stackoverflow.com/q/13333585
- [6] VS Code, `contributes.walkthroughs` — code.visualstudio.com/api
  (walkthroughs empaquetados en la extensión)
- [7] Homebrew, issue #40863 — caveats mostrados en `brew info` aun
  sin instalar — github.com/Homebrew/legacy-homebrew/issues/40863
