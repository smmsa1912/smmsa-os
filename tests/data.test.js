import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { profile, projects, publications, skills } from '../src/data.js'
import { appMeta } from '../src/appMeta.js'

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const unique = (values) => new Set(values).size === values.length

test('profile has the minimum public contact details', () => {
  assert.ok(profile.name?.trim(), 'profile name is required')
  assert.match(profile.email ?? '', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'profile email must look valid')
  assert.ok(isHttpsUrl(profile.github), 'GitHub URL must use HTTPS')
  assert.ok(isHttpsUrl(profile.linkedin), 'LinkedIn URL must use HTTPS')
  assert.equal(profile.resume, '/resume.pdf', 'resume should point to the packaged public PDF')
})

test('projects have unique IDs and core case-study content', () => {
  assert.ok(projects.length >= 3, 'portfolio should feature multiple projects')
  assert.ok(unique(projects.map((project) => project.id)), 'project IDs must be unique')
  for (const project of projects) {
    assert.ok(project.name?.trim(), `${project.id} needs a name`)
    assert.ok(project.summary?.trim(), `${project.id} needs a summary`)
    assert.ok(Array.isArray(project.points) && project.points.length > 0, `${project.id} needs implementation notes`)
    assert.ok(Array.isArray(project.stack) && project.stack.length > 0, `${project.id} needs a technology stack`)
    assert.ok(Array.isArray(project.workflow) && project.workflow.length >= 3, `${project.id} needs a high-level workflow`)
    assert.ok(project.scopeNote?.trim(), `${project.id} needs an explicit scope note`)
    for (const step of project.workflow) {
      assert.ok(step.title?.trim(), `${project.id} workflow step needs a title`)
      assert.ok(step.detail?.trim(), `${project.id} workflow step needs a description`)
    }
  }
})

test('project repository and demo links are valid HTTPS URLs when present', () => {
  for (const project of projects) {
    if (project.repo) assert.ok(isHttpsUrl(project.repo), `${project.id} repository must use HTTPS`)
    if (project.demo) assert.ok(isHttpsUrl(project.demo), `${project.id} demo must use HTTPS`)
  }
})

test('project publication references resolve to known papers', () => {
  assert.ok(unique(publications.map((paper) => paper.id)), 'publication IDs must be unique')
  const publicationIds = new Set(publications.map((paper) => paper.id))
  for (const project of projects) {
    for (const paperId of project.paperIds ?? []) {
      assert.ok(publicationIds.has(paperId), `${project.name} references unknown paper ${paperId}`)
    }
  }
  for (const paper of publications) {
    assert.ok(paper.title?.trim(), 'publication title is required')
    assert.ok(isHttpsUrl(paper.href), `${paper.id} link must use HTTPS`)
  }
})

test('recorded backtest metrics are explicitly caveated', () => {
  const tradeAssist = projects.find((project) => project.id === 'tradeassist')
  assert.ok(tradeAssist, 'TradeAssist case study must exist')
  assert.equal(tradeAssist.metrics?.length, 4, 'TradeAssist should show the selected recorded run')
  assert.match(tradeAssist.metricsNote ?? '', /not live trading performance/i)
  assert.match(tradeAssist.scopeNote ?? '', /not be presented as live profit/i)
})

test('skills inventory contains labeled categories and items', () => {
  const categories = Object.entries(skills)
  assert.ok(categories.length > 0)
  for (const [category, values] of categories) {
    assert.ok(category.trim())
    assert.ok(Array.isArray(values) && values.length > 0, `${category} needs at least one skill`)
  }
})


test('portfolio-critical windows open at comfortable desktop sizes', () => {
  assert.ok(appMeta.quick.w >= 960 && appMeta.quick.h >= 640, 'Portfolio Home should be large enough to showcase its content')
  assert.ok(appMeta.projects.w >= 900 && appMeta.projects.h >= 620, 'Projects should have room for the directory and case study')
  assert.ok(appMeta.skills.w >= 900 && appMeta.papers.w >= 900, 'Skills and Publications should use the available desktop space')
})


test('all architecture diagrams exist and identify their provenance', async () => {
  const publicationIds = new Set(publications.map((paper) => paper.id))
  const diagrams = projects.flatMap((project) => (project.diagrams ?? []).map((diagram) => ({ project, diagram })))
  assert.equal(diagrams.length, 6, 'three reference-paper diagrams and three project architecture diagrams should be included')
  for (const { project, diagram } of diagrams) {
    assert.ok(diagram.title?.trim(), `${project.id} diagram needs a title`)
    assert.ok(diagram.caption?.trim(), `${project.id} diagram needs a provenance caption`)
    assert.ok(diagram.sourceLabel?.trim() || diagram.sourcePaperId, `${project.id} diagram needs a source label or paper reference`)
    if (diagram.sourcePaperId) assert.ok(publicationIds.has(diagram.sourcePaperId), `${project.id} diagram references an unknown source paper`)
    if (diagram.sourceUrl) assert.ok(isHttpsUrl(diagram.sourceUrl), `${project.id} diagram source URL must use HTTPS`)
    assert.ok(diagram.src.startsWith('/diagrams/') && diagram.src.endsWith('.svg'), `${project.id} diagram should be an SVG asset`)
    const diagramPath = new URL(`../public${diagram.src}`, import.meta.url)
    const svg = await readFile(diagramPath, 'utf8')
    assert.match(svg, /<svg[^>]+viewBox=/i, `${diagram.src} needs a viewBox`)
    assert.match(svg, /<title/i, `${diagram.src} needs an accessible title`)
    assert.match(svg, /Source(?: basis)?:/i, `${diagram.src} must visibly identify its source basis`)
  }
})

test('OSCAR, TradeAssist, and FinVerse each have a dedicated architecture diagram', () => {
  for (const id of ['oscar', 'tradeassist', 'finverse']) {
    const project = projects.find((item) => item.id === id)
    assert.ok(project, `${id} project entry must exist`)
    assert.ok(project.diagrams?.length, `${id} needs a dedicated architecture diagram`)
    assert.match(project.diagrams[0].src, new RegExp(`/diagrams/${id === 'oscar' ? 'oscar-system-architecture' : id === 'tradeassist' ? 'tradeassist-research-pipeline' : 'finverse-payment-architecture'}\\.svg`))
  }
  const tradeAssist = projects.find((item) => item.id === 'tradeassist')
  assert.match(tradeAssist.diagrams[0].caption, /high-level/i, 'TradeAssist diagram must not claim source-code verification')
  const finVerse = projects.find((item) => item.id === 'finverse')
  assert.match(finVerse.diagrams[0].caption, /authentication mismatch/i, 'FinVerse diagram should identify the known device/API integration gap')
})
