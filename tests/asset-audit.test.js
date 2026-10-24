import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { profile, projects, publications } from '../src/data.js'

const pathExists = async (path) => {
  try { await access(path); return true } catch { return false }
}

const publicRoot = new URL('../public/', import.meta.url)

test('portfolio profile points to real-looking public HTTPS destinations', () => {
  const github = new URL(profile.github)
  const linkedin = new URL(profile.linkedin)
  assert.equal(github.protocol, 'https:')
  assert.equal(github.hostname, 'github.com')
  assert.equal(github.pathname.replace(/\/$/, ''), '/smmsa1912')
  assert.equal(linkedin.protocol, 'https:')
  assert.match(linkedin.hostname, /linkedin\.com$/)
  assert.match(linkedin.pathname, /^\/in\/[a-z0-9-]+\/?$/i)
})

test('all portfolio diagram assets and resume are packaged locally', async () => {
  const diagramPaths = projects.flatMap((project) => (project.diagrams ?? []).map((diagram) => diagram.src))
  assert.equal(diagramPaths.length, 6)
  for (const assetPath of [...diagramPaths, profile.resume]) {
    assert.ok(assetPath.startsWith('/'), `${assetPath} should be a root-relative public asset`)
    assert.ok(await pathExists(new URL(assetPath.slice(1), publicRoot)), `${assetPath} is missing from public/`)
  }
  for (const project of projects) {
    for (const diagram of project.diagrams ?? []) {
      const svg = await readFile(new URL(diagram.src.slice(1), publicRoot), 'utf8')
      assert.match(svg, /<svg\b/i, `${diagram.src} should be SVG`)
      assert.doesNotMatch(svg, /href=["']#(?:TODO|FIXME|placeholder)["']/i, `${diagram.src} contains a placeholder link`)
    }
  }
})

test('publication destinations and project repositories have no placeholder hostnames', () => {
  for (const paper of publications) {
    const url = new URL(paper.href)
    assert.equal(url.protocol, 'https:')
    assert.ok(!/example\.(com|org|net)|localhost|127\.0\.0\.1/i.test(url.hostname), `${paper.id} uses a placeholder host`)
  }
  for (const project of projects) {
    for (const link of [project.repo, project.demo].filter(Boolean)) {
      const url = new URL(link)
      assert.equal(url.protocol, 'https:')
      assert.ok(!/example\.(com|org|net)|localhost|127\.0\.0\.1/i.test(url.hostname), `${project.id} uses a placeholder host`)
    }
  }
})

test('site has a title, description, viewport-fit metadata, and bundled favicon', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /<title>Andrew Neil — Developer Portfolio<\/title>/)
  assert.match(html, /name="description" content="[^"]+"/)
  assert.match(html, /viewport-fit=cover/)
  assert.ok(await pathExists(new URL('favicon.svg', publicRoot)))
})
