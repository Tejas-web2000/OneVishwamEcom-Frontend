import MiniSearch from 'minisearch';

/**
 * Standardized SearchIndex powered by npm 'minisearch'
 * Provides full-text inverted index, fuzzy search tolerance, and prefix autocomplete.
 */
export class SearchIndex {
  constructor(items = [], fields = ['title', 'name', 'brand', 'city', 'location', 'category', 'subcategory']) {
    this.fields = fields;
    this.itemsMap = new Map();
    this.miniSearch = new MiniSearch({
      fields: this.fields,
      idField: '_searchId',
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        combineWith: 'AND',
      },
    });

    if (Array.isArray(items) && items.length > 0) {
      this.buildIndex(items);
    }
  }

  buildIndex(items) {
    this.itemsMap.clear();
    this.miniSearch.removeAll();

    const docs = items.map((item, index) => {
      const id = String(item._id || item.id || `idx_${index}`);
      this.itemsMap.set(id, item);

      const doc = { _searchId: id };
      for (const f of this.fields) {
        const val = item[f];
        if (typeof val === 'string') {
          doc[f] = val;
        } else if (Array.isArray(val)) {
          doc[f] = val.map((x) => String(x.value || x)).join(' ');
        }
      }
      return doc;
    });

    this.miniSearch.addAll(docs);
  }

  search(query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return Array.from(this.itemsMap.values());
    }

    const results = this.miniSearch.search(query.trim());
    return results.map((r) => this.itemsMap.get(r.id)).filter(Boolean);
  }

  getById(id) {
    return this.itemsMap.get(String(id)) || null;
  }
}

export { MiniSearch };
export default SearchIndex;
