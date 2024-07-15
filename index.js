#!/usr/bin/env bun

import { watch } from 'fs'
import { parseArgs } from 'util'
import { Glob } from 'bun'
const { log } = console

const RESET = `\x1b[0m`
const COLORIZE = (text) => `\x1b[${text}${RESET}`
const BLUE = (text) => COLORIZE(`34m${text}`)
const CYAN = (text) => COLORIZE(`36m${text}`)
const DIM = (text) => COLORIZE(`2m${text}`)

function now() {
  return new Date().toLocaleTimeString().replace(/\s*(AM|PM)/, '')
}

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    files: {
      type: 'string',
    },
    port: {
      type: 'string',
      default: '3000',
    },
  },
  strict: true,
  allowPositionals: true,
})

if (!values.files) {
  throw new Error('Missing files parameter in Anewbis command.')
}

let filesToWatch = values.files.split(';').map((files) => new Glob(files))
let liveReloadClient = Bun.file(import.meta.dir + '/live-reload.js')
let connections = []

filesToWatch.forEach(async (files) => {
  for await (let file of files.scan('.')) {
    watch(file, (event, filename) => {
      connections.forEach((ws) => {
        log(
          DIM(now()),
          CYAN(`[change]`),
          BLUE(filename),
          DIM('Reloading or injecting!')
        )
        ws.send(
          JSON.stringify({
            event,
            filename,
            ext: filename.split('.')[1],
          })
        )
      })
    })
  }
})

Bun.serve({
  port: 3001,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return
    }
    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    open(ws) {
      log(DIM(now()), CYAN(`[⚭]`), DIM('Connected to client!'))
      connections.push(ws)
    },
    close(ws) {
      log(DIM(now()), CYAN(`[%]`), DIM('Client disconnected!'))
      connections = connections.filter((connection) => connection !== ws)
    },
    message(ws, message) {
      log(DIM(now()), CYAN(`[message from client]`), DIM(message))
    },
  },
})

Bun.serve({
  port: values.port,
  fetch(req) {
    if (req.url.includes(':3000/live-reload.js')) {
      return new Response(liveReloadClient, {
        headers: { 'Content-Type': 'application/javascript' },
      })
    }

    return new Response('404: File not found', { status: 404 })
  },
})
