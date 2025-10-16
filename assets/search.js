(() => {
  const searchInput = document.getElementById("search");
  const catalogContainers = document.querySelectorAll("[data-catalog]");
  let indexPromise;

  const ensureIndex = () => {
    if (!indexPromise) {
      indexPromise = fetch("/assets/search-index.json")
        .then(response => (response.ok ? response.json() : { entries: [] }))
        .catch(() => ({ entries: [] }));
    }
    return indexPromise;
  };

  const normalise = value => (value || "").toString().toLowerCase();

  const valueSlug = value => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.slug || value.key || value.id || value.title || value.name || "";
    }
    return String(value);
  };

  const valueLabel = value => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.title || value.name || value.slug || value.key || "";
    }
    return String(value);
  };

  const valueUrl = (value, fallbackPrefix) => {
    if (!value) return "";
    if (typeof value === "object" && value.url) return value.url;
    const slug = valueSlug(value);
    if (fallbackPrefix && slug) {
      return `${fallbackPrefix}${slug}/`;
    }
    return "";
  };

  const parseQuery = value => {
    const filters = { meme: [], theme: [], type: [] };
    const terms = [];

    (value || "")
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .forEach(token => {
        if (token.includes(":")) {
          const [rawField, rawValue] = token.split(":");
          const field = rawField.trim();
          const filterValue = rawValue.trim();
          if (filters[field] && filterValue) {
            filters[field].push(filterValue);
            return;
          }
        }
        terms.push(token);
      });

    return { filters, terms };
  };

  const arrayHasAll = (source, expected) => {
    if (!expected.length) return true;
    const lookup = new Set((source || []).map(item => normalise(valueSlug(item))));
    return expected.every(item => lookup.has(item));
  };

  const entryMatches = (entry, query) => {
    if (!entry) return false;
    const { filters, terms } = query;

    if (filters.type.length && !filters.type.includes(normalise(entry.type))) {
      return false;
    }

    if (!arrayHasAll(entry.memes || [], filters.meme)) {
      return false;
    }

    if (!arrayHasAll(entry.themes || [], filters.theme)) {
      return false;
    }

    if (!terms.length) {
      return true;
    }

    const haystacks = [
      entry.title,
      entry.description,
      ...(entry.memes || []).map(valueLabel),
      ...(entry.themes || []).map(valueLabel),
      ...(entry.ancestors || []).map(valueLabel),
      ...(entry.descendants || []).map(valueLabel),
      ...(entry.models || []).map(valueLabel),
    ].map(normalise);

    return terms.every(term =>
      haystacks.some(text => text.includes(term))
    );
  };

  const createChip = (label, href, modifier) => {
    const className = modifier ? `chip ${modifier}` : "chip";
    if (!href) {
      const span = document.createElement("span");
      span.className = className;
      span.textContent = label;
      return span;
    }

    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = label;
    return link;
  };

  const createResultItem = entry => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.title;
    li.appendChild(link);

    if (entry.description) {
      const summary = document.createElement("p");
      summary.textContent = entry.description;
      li.appendChild(summary);
    }

    const tags = document.createElement("p");
    const parts = [];
    if (entry.type) {
      parts.push(entry.type.charAt(0).toUpperCase() + entry.type.slice(1));
    }
    if (entry.memes?.length) {
      parts.push(
        `Memes: ${entry.memes.map(valueLabel).join(", ")}`
      );
    }
    if (entry.themes?.length && entry.type === "model") {
      parts.push(
        `Themes: ${entry.themes.map(valueLabel).join(", ")}`
      );
    }
    if (entry.models?.length && entry.type !== "model") {
      parts.push(
        `Models: ${entry.models.map(valueLabel).join(", ")}`
      );
    }
    if (parts.length) {
      tags.textContent = parts.join(" • ");
      li.appendChild(tags);
    }

    return li;
  };

  const renderSearchResults = (container, results, query) => {
    container.innerHTML = "";
    if (!query || !query.trim()) {
      return;
    }

    const list = document.createElement("ul");
    if (!results.length) {
      const item = document.createElement("li");
      item.textContent = "No matches found";
      list.appendChild(item);
    } else {
      results.forEach(entry => list.appendChild(createResultItem(entry)));
    }
    container.appendChild(list);
  };

  if (searchInput) {
    const resultContainer = document.createElement("div");
    resultContainer.id = "search-results";
    searchInput.insertAdjacentElement("afterend", resultContainer);

    const runSearch = async () => {
      const queryValue = searchInput.value;
      if (!queryValue.trim()) {
        resultContainer.innerHTML = "";
        return;
      }

      const index = await ensureIndex();
      const query = parseQuery(queryValue);
      const results = (index.entries || [])
        .filter(entry => entryMatches(entry, query))
        .slice(0, 12);

      renderSearchResults(resultContainer, results, queryValue);
    };

    searchInput.addEventListener("input", runSearch);
    searchInput.addEventListener("focus", runSearch);
    searchInput.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        searchInput.value = "";
        resultContainer.innerHTML = "";
      }
    });

    document.addEventListener("click", event => {
      if (
        event.target !== searchInput &&
        !resultContainer.contains(event.target)
      ) {
        resultContainer.innerHTML = "";
      }
    });
  }

  const renderCatalogList = (listEl, entries) => {
    listEl.innerHTML = "";
    const sorted = [...entries].sort((a, b) => {
      const titleA = valueLabel(a.title);
      const titleB = valueLabel(b.title);
      return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
    });

    if (!sorted.length) {
      const empty = document.createElement("li");
      empty.className = "catalog__item";
      const message = document.createElement("p");
      message.textContent = "No entries match these filters.";
      empty.appendChild(message);
      listEl.appendChild(empty);
      return;
    }

    sorted.forEach(entry => {
      const item = document.createElement("li");
      item.className = "catalog__item";

      const heading = document.createElement("h3");
      const link = document.createElement("a");
      link.href = entry.url;
      link.textContent = entry.title;
      heading.appendChild(link);
      item.appendChild(heading);

      if (entry.description) {
        const summary = document.createElement("p");
        summary.textContent = entry.description;
        item.appendChild(summary);
      }

      if (entry.type === "model") {
        const tags = document.createElement("div");
        tags.className = "catalog__tags";

        (entry.memes || []).forEach(meme => {
          tags.appendChild(
            createChip(
              valueLabel(meme),
              valueUrl(meme, "/meme/"),
              null
            )
          );
        });
        (entry.themes || []).forEach(theme => {
          tags.appendChild(
            createChip(
              valueLabel(theme),
              valueUrl(theme, "/theme/"),
              "chip--theme"
            )
          );
        });

        if (tags.children.length) {
          item.appendChild(tags);
        }
      } else if (entry.models?.length) {
        const related = document.createElement("div");
        related.className = "catalog__related";

        const label = document.createElement("span");
        label.className = "catalog__related-label";
        label.textContent = "Models";
        related.appendChild(label);

        const tags = document.createElement("div");
        tags.className = "catalog__tags";
        entry.models.forEach(model => {
          tags.appendChild(
            createChip(valueLabel(model), valueUrl(model, "/model/"))
          );
        });
        related.appendChild(tags);

        item.appendChild(related);
      }

      listEl.appendChild(item);
    });
  };

  const initCatalog = (container, entries) => {
    const type = container.dataset.catalog;
    const listEl = container.querySelector("[data-catalog-list]");
    if (!type || !listEl) return;

    const textInput = container.querySelector("[data-filter-text]");
    const memeSelect = container.querySelector("[data-filter-meme]");
    const themeSelect = container.querySelector("[data-filter-theme]");

    const baseQuery = parseQuery("");
    baseQuery.filters.type.push(normalise(type));

    const update = () => {
      const query = parseQuery(textInput ? textInput.value : "");
      query.filters.type = [...baseQuery.filters.type];

      if (memeSelect && memeSelect.value) {
        query.filters.meme.push(normalise(memeSelect.value));
      }
      if (themeSelect && themeSelect.value) {
        query.filters.theme.push(normalise(themeSelect.value));
      }

      const filtered = entries.filter(entry => entryMatches(entry, query));
      renderCatalogList(listEl, filtered);
    };

    if (textInput) {
      textInput.addEventListener("input", update);
    }
    if (memeSelect) {
      memeSelect.addEventListener("change", update);
    }
    if (themeSelect) {
      themeSelect.addEventListener("change", update);
    }

    update();
  };

  if (catalogContainers.length) {
    ensureIndex().then(index => {
      const entries = index.entries || [];
      catalogContainers.forEach(container => initCatalog(container, entries));
    });
  }
})();
