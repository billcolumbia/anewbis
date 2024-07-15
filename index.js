#!/usr/bin/env bun

import { watch } from 'fs'
import { parseArgs } from 'util'
import { Glob } from 'bun'
import { logger } from './logger'

const HTTP_PORT = '3000'
const { values } = parseArgs({
  args: Bun.argv,
  options: {
    files: {
      type: 'string',
    },
    port: {
      type: 'string',
      default: HTTP_PORT,
    },
  },
  strict: true,
  allowPositionals: true,
})

if (!values.files) {
  throw new Error('Missing files parameter for Anewbis command.')
}

let filesToWatch = values.files.split(';').map((files) => new Glob(files))
let liveReloadClient = Bun.file(import.meta.dir + '/live-reload.js')
let connections = []

filesToWatch.forEach(async (files) => {
  for await (let file of files.scan('.')) {
    watch(file, (event, filename) => {
      connections.forEach((ws) => {
        logger.change(filename),
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
      logger.connected()
      connections.push(ws)
    },
    close(ws) {
      logger.disconnected()
      connections = connections.filter((connection) => connection !== ws)
    },
    message(ws, message) {
      logger.messaged(message)
    },
  },
})

Bun.serve({
  port: values.port,
  fetch(req) {
    if (req.url.includes(`:${HTTP_PORT}/live-reload.js`)) {
      return new Response(liveReloadClient, {
        headers: { 'Content-Type': 'application/javascript' },
      })
    }

    return new Response('404: File not found', { status: 404 })
  },
})
