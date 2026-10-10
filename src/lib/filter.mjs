export function matchesProject(project, category, query) {
  const categoryMatches = category === 'All' || project.category === category;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text = project.search.toLowerCase();
  return categoryMatches && terms.every((term) => text.includes(term));
}