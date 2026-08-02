# Terminología Agnóstica de Herramientas

Este documento define la terminología estándar que los skills usan para referirse a herramientas comunes, sin asumir un producto específico.

## Mapeo de Conceptos

| Concepto | Términos Agnósticos | Ejemplos de Herramientas |
|----------|-------------------|-------------------------|
| **Sistema de gestión de tareas** | "herramienta de gestión de tareas", "sistema de tickets", "gestor de trabajo" | Linear, Jira, Asana, GitHub Issues, Trello |
| **Documentación de referencia** | "documentación", "especificación de diseño", "TDD", "documentación compartida" | Notion, Confluence, Google Docs, Markdown en repo |
| **Control de versiones** | "sistema de control de versiones", "repositorio", "rama" | GitHub, GitLab, Gitea, Bitbucket |
| **Pull Request** | "Pull Request" (término estándar mantenido) | GitHub, GitLab (Merge Requests), Gitea |
| **Revisión de cambios** | "revisión de código", "análisis de cambios" | PR reviews, code review tools |

## Directrices de Redacción

1. **No asumir herramientas específicas** en instrucciones dirigidas al usuario
2. **Usar términos funcionales** que describan el rol, no la herramienta
3. **Pull Request es excepción**: término de uso común, mantenlo como está
4. **Ejemplificación neutral**: cuando des ejemplos, menciona múltiples opciones sin especificar marcas

## Ejemplos de Reemplazo

### ❌ No agnóstico:
```
"Carga el contexto de Linear para entender las tareas prioritarias"
"Revisa la especificación en Notion antes de implementar"
"Publica en GitHub mediante PRs"
```

### ✅ Agnóstico:
```
"Carga el contexto de tu herramienta de gestión de tareas para entender las prioridades"
"Revisa la especificación en la documentación compartida antes de implementar"
"Publica mediante Pull Requests en tu sistema de control de versiones"
```

## Notas Técnicas

- Las instrucciones NO deben depender de herramientas específicas en ningún contexto
- Referencias a herramientas deben ser completamente agnósticas y funcionales
- Los skills deben funcionar con cualquier combinación de herramientas de gestión, documentación y control de versiones
