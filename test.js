// test.js — проверка инвариантов канона AWARA
// Запуск: node test.js
// Без зависимостей. Только встроенные модули Node >= 18.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
const exportsDir = join(__dirname, 'exports')

let passed = 0
let failed = 0

function check(name, fn) {
	try {
		fn()
		passed++
		console.log(`  PASS  ${name}`)
	} catch (e) {
		failed++
		console.log(`  FAIL  ${name}`)
		console.log(`        ${e.message}`)
	}
}

function loadJson(path) {
	if (!existsSync(path)) throw new Error(`файл не найден: ${path}`)
	return JSON.parse(readFileSync(path, 'utf8'))
}

function count(data) {
	if (Array.isArray(data)) return data.length
	if (data && typeof data === 'object') return Object.keys(data).length
	throw new Error('ожидался массив или объект')
}

function expectCount(path, expected) {
	const data = loadJson(path)
	const n = count(data)
	if (n !== expected) throw new Error(`ожидалось ${expected}, получено ${n}`)
}

console.log('AWARA — проверка канона\n')

check('Агентов = 21 (data/agents.json)', () => {
	expectCount(join(dataDir, 'agents.json'), 21)
})

check('Матриц = 33 (data/matrices.json)', () => {
	expectCount(join(dataDir, 'matrices.json'), 33)
})

check('Соответствий агент×матрица = 693 (data/agent_matrix_map.json)', () => {
	expectCount(join(dataDir, 'agent_matrix_map.json'), 693)
})

check('Локи = 14 (data/locas.json, если есть)', () => {
	const p = join(dataDir, 'locas.json')
	if (!existsSync(p)) {
		console.log('        пропущено: файл ещё не создан')
		return
	}
	expectCount(p, 14)
})

check('Чакры-меры = 9 (data/chakras.json, если есть)', () => {
	const p = join(dataDir, 'chakras.json')
	if (!existsSync(p)) {
		console.log('        пропущено: файл ещё не создан')
		return
	}
	expectCount(p, 9)
})

check('Полная колода = 1578 карт (exports/all_high_quality_card_prompts.json)', () => {
	expectCount(join(exportsDir, 'all_high_quality_card_prompts.json'), 1578)
})

console.log(`\nИтог: ${passed} пройдено, ${failed} провалено`)
process.exit(failed > 0 ? 1 : 0)
