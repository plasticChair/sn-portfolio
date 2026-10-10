import type { CollectionEntry } from 'astro:content';

export function sortProjects(projects: CollectionEntry<'projects'>[]) {
  return [...projects].sort((first, second) =>
    Number(second.data.featured) - Number(first.data.featured)
    || first.data.order - second.data.order
    || (second.data.year ?? 0) - (first.data.year ?? 0)
    || first.data.title.localeCompare(second.data.title),
  );
}