#!/usr/bin/env node

main()
  .then(() => process.exit(0))
  .catch(err => console.error(err.message, err) && process.exit(1))

async function main () {

}
