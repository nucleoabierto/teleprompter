#!/usr/bin/env node

import { createRequire } from 'node:module'

import { Command } from 'commander'

import bootstrapCommand from '#src/commands/bootstrap'
import listCommand from '#src/commands/list'
import runCommand from '#src/commands/run'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

const program = new Command()

program
  .name('teleprompter')
  .description('CLI que copia configuraciones de agentes a tu proyecto')
  .version(packageJson.version)

program
  .argument('[repo]', 'Repositorio en formato owner/repo (opcional). Si no se especifica, usa la configuración básica incluida.')
  .description(`
Instala una configuración de agente en tu proyecto desde un repositorio remoto o local.

Ejemplos:
  $ teleprompter                             # Usa la configuración básica
  $ teleprompter owner/repo                  # Instala desde GitHub
  $ teleprompter owner/repo -f               # Sobrescribe configuración existente
  $ teleprompter owner/repo -b dev           # Usa rama 'dev' en lugar de 'main'
  $ teleprompter owner/repo --no-cache       # Descarga sin usar caché
  $ teleprompter owner/repo --select         # Selección interactiva
  $ teleprompter owner/repo --config agents  # Filtra por nombre
  `)
  .option('-d, --dir <path>', 'Directorio base del proyecto donde se instalará la configuración', process.cwd())
  .option('-f, --force', 'Sobrescribir configuración existente (por defecto: false)')
  .option('-b, --branch <branch>', 'Rama del repositorio GitHub a usar', 'main')
  .option('--no-cache', 'Desactivar caché global (descarga siempre)', false)
  .option('--select', 'Seleccionar interactivamente qué configuraciones instalar', false)
  .option('--config <name>', 'Filtrar configuraciones por nombre', '')
  .option('-v, --verbose', 'Mostrar información detallada para debugging', false)
  .action((repo, options) => runCommand(repo, options))

program
  .command('list')
  .argument('[repo]', 'Repositorio en formato owner/repo (opcional). Si se especifica, lista configuraciones disponibles en ese repositorio.')
  .description(`
Lista configuraciones disponibles. Sin argumentos, muestra las configuraciones
instaladas localmente. Con un repositorio, lista las configuraciones disponibles
en ese repositorio remoto.

Ejemplos:
  $ teleprompter list                    # Lista configuraciones instaladas
  $ teleprompter list owner/repo         # Lista configuraciones en repositorio remoto
  $ teleprompter list --cached           # Lista configuraciones en caché local
  $ teleprompter list --criteria         # Muestra también los criterios de uso
  `)
  .option('-d, --dir <path>', 'Directorio base del proyecto a consultar', process.cwd())
  .option('-c, --criteria', 'Mostrar criterios de uso de cada configuración')
  .option('--cached', 'Listar configuraciones disponibles en el caché local')
  .option('-b, --branch <branch>', 'Rama del repositorio GitHub a usar (solo con repo)', 'main')
  .option('--no-cache', 'Desactivar caché al listar repositorio remoto')
  .option('-v, --verbose', 'Mostrar información detallada para debugging', false)
  .action((repo, options) => listCommand(repo, options))

program
  .command('bootstrap')
  .description(`
Muestra las instrucciones de uso (bootstrap) de todas las configuraciones instaladas.
Útil para ver rápidamente cómo usar cada agente configurado.

Ejemplos:
  $ teleprompter bootstrap
  `)
  .option('-d, --dir <path>', 'Directorio base del proyecto', process.cwd())
  .action(bootstrapCommand)

program.parse()
