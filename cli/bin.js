#!/usr/bin/env node
import { run } from './index.js'

run(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  })
