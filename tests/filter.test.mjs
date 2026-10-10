import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesProject } from '../src/lib/filter.mjs';

const project = { category: 'Embedded', search: 'A smarter sensor node ESP32 PCB design C++ 2026' };

test('all projects are visible with no query', () => {
  assert.equal(matchesProject(project, 'All', ''), true);
});

test('category matching is exact', () => {
  assert.equal(matchesProject(project, 'Embedded', ''), true);
  assert.equal(matchesProject(project, 'Robotics', ''), false);
});

test('search ignores case and surrounding whitespace', () => {
  assert.equal(matchesProject(project, 'All', '  ESP32  '), true);
  assert.equal(matchesProject(project, 'All', 'SENSOR'), true);
});

test('search accepts words in any order but requires every word', () => {
  assert.equal(matchesProject(project, 'All', '2026 sensor pcb'), true);
  assert.equal(matchesProject(project, 'All', 'sensor solar'), false);
});

test('category and query are combined', () => {
  assert.equal(matchesProject(project, 'Embedded', 'C++'), true);
  assert.equal(matchesProject(project, 'Mechanical', 'C++'), false);
});

test('empty and unusual queries are treated as text', () => {
  assert.equal(matchesProject(project, 'All', ' \t\n '), true);
  assert.equal(matchesProject(project, 'All', '<script>'), false);
  assert.equal(matchesProject({ category: '', search: '' }, 'All', ''), true);
});