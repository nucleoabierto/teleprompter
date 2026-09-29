# Mejores prácticas para el README de un paquete

> **Fecha:** 2026-09

## Propósito

Sintetizar las mejores prácticas de escritura de un `README.md` para un
paquete npm de línea de comandos, como entrada de la redacción de la
documentación pública de Teleprompter.

## Hallazgos

### Propósito y audiencia

- El README es lo primero que ve quien visita el repositorio o la página
  del paquete; debe responder qué hace el proyecto, por qué es útil y
  cómo empezar a usarlo [1][4].
- Debe contener solo la información necesaria para empezar a usar y
  contribuir; la documentación extensa va en documentos dedicados [1][3].
- La descripción debe decir qué logra el proyecto —el porqué—, no de qué
  está hecho; se recomienda segunda persona y verbos de acción [3].

### Estructura y orden

- El orden de secciones estandarizado es: título, descripción corta,
  descripción larga, índice de contenido, instalación, uso, secciones
  extra, API, mantenedores, agradecimientos, contribución y licencia;
  las secciones opcionales pueden omitirse pero el orden se conserva [2].
- La información se organiza en embudo cognitivo: de lo general a lo
  específico, para que el lector pueda descartar el proyecto pronto si
  no es lo que busca [7].
- Un README útil responde rápido a tres preguntas: qué hace, cómo se
  instala y cómo se completa una tarea con sentido; esas respuestas van
  antes que las notas de arquitectura o el catálogo de funciones [4].

### Brevedad y remisión

- El README ideal es lo más corto posible sin quedarse corto: la
  documentación detallada vive en páginas separadas [5].
- Si supera tres o cuatro pantallas, conviene un índice de contenido;
  si supera diez o doce, hay que mover contenido a otros documentos [3].
- El README debe indicar dónde encontrar la documentación completa:
  archivos compañeros, comando de ayuda o sitio de documentación [3][5].

### Instalación y uso

- Listar los prerrequisitos y los pasos para instalar y usar el proyecto
  una vez; la guía se detiene cuando el proyecto ha funcionado una
  primera vez, y el uso extendido va en documentos aparte [3].
- El inicio rápido debe ser copiable y completo, listo para pegar en la
  terminal [4]; conviene incluir la instalación aunque sea trivial, con
  enlace a npm para lectores nuevos en el ecosistema [5].
- Las opciones de un CLI se presentan en una tabla compacta o se
  enlazan a la referencia correspondiente [4].

### Requisitos formales

- El archivo se llama `README.md` y vive en la raíz del paquete; npm lo
  renderiza en la página del paquete como GitHub Flavored Markdown [2][6].
- El título coincide con el nombre del repositorio y del paquete; la
  descripción corta tiene menos de 120 caracteres; no hay enlaces rotos
  y los ejemplos de código son correctos [2].
- Conviene enlazar los módulos, ideas y proyectos citados [5].
- Debe incluirse la licencia, como parte de las expectativas que el
  README comunica [1][4].

## Conclusión

Las prácticas convergen en un README que es puerta de entrada, no
documentación completa. Las reglas aplicables a Teleprompter son:

1. Título igual al nombre del proyecto, con una descripción corta en su
   propia línea.
2. Un párrafo que diga qué hace el producto y para quién, antes que
   cualquier detalle técnico.
3. Requisitos e instalación como inicio rápido copiable (`npx`).
4. Uso del comando `install` con sus opciones en formato compacto y los
   códigos de salida; el detalle del comportamiento va en la
   documentación de producto enlazada, no en el README.
5. Enlace a la documentación completa y sección de licencia.
6. Todo lo afirmado corresponde a comportamiento real del CLI.

## Limitaciones

Las fuentes son guías prácticas de la industria y una especificación
comunitaria (Standard Readme), no estándares formales; hay consenso
amplio sobre estructura y brevedad, pero los detalles (insignias,
tablas de contenido, ejemplos) varían según la fuente. La investigación
es de profundidad rápida: una fuente por afirmación salvo en los puntos
de convergencia.

## Referencias

- [1] GitHub Docs, «About READMEs» —
  docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- [2] Richard Litt, «Standard Readme — spec» —
  github.com/RichardLitt/standard-readme/blob/HEAD/spec.md
- [3] Daniel D. Beck, «README checklist» —
  github.com/ddbeck/readme-checklist
- [4] mdkit, «How to Write a GitHub README: Examples + Template» —
  mdkit.io/blog/github-readme-guide
- [5] noffle, «Art of README» —
  github.com/noffle/art-of-readme
- [6] npm Docs, «About package README files» —
  docs.npmjs.com/about-package-readme-files/
- [7] «common-readme» —
  github.com/bashayer-alrumahi/common-readme
