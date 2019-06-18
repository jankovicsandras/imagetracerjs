import test from 'ava'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs';

test('should build', async t => {
  t.notThrows(()=> execSync('npm run build', { stdio: 'pipe' }))
})

test('should output panda.svg', async t => {
  t.false(existsSync('tmp/panda.png.svg'))
  const r = execSync('node bin/image-tracer.js --input ../panda.png --output tmp', { stdio: 'pipe' })
  t.true(readFileSync('tmp/panda.png.svg').toString().includes('<svg'))
})
