// Emits evidenceStore as JSON for hydration
const { evidenceStore } = globalThis; // we’ll expose it below

module.exports = class {
  data() {
    return {
      permalink: "/assets/evidence.json",
      eleventyExcludeFromCollections: true,
    };
  }
  render() {
    // If not available (first pass), still return valid JSON
    const items = Array.isArray(globalThis.evidenceStore) ? globalThis.evidenceStore : [];
    return JSON.stringify({ items }, null, 2);
  }
;}
