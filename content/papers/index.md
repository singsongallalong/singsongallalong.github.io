---
layout: base.njk
title: Models
permalink: /model/
eleventyExcludeFromCollections: true
---
# Model catalog

Use the filters below to narrow the catalog of recorded models by the memes and themes they exhibit.

<div class="catalog" data-catalog="model">
  <div class="catalog__controls">
    <label class="catalog__control">
      <span>Meme</span>
      <select data-filter-meme>
        <option value="">All memes</option>
        {% for meme in collections.memes | sortByTitle %}
        <option value="{{ meme.fileSlug }}">{{ meme.data.title or meme.fileSlug }}</option>
        {% endfor %}
      </select>
    </label>
    <label class="catalog__control">
      <span>Theme</span>
      <select data-filter-theme>
        <option value="">All themes</option>
        {% for theme in collections.themes | sortByTitle %}
        <option value="{{ theme.fileSlug }}">{{ theme.data.title or theme.fileSlug }}</option>
        {% endfor %}
      </select>
    </label>
    <label class="catalog__control">
      <span>Search</span>
      <input type="search" data-filter-text placeholder="Search models…">
    </label>
  </div>
  <ul class="catalog__list" data-catalog-list>
    {% for model in collections.papers %}
    <li class="catalog__item">
      <h3><a href="{{ model.url }}">{{ model.data.title or model.fileSlug }}</a></h3>
      {% if model.data.description %}
      <p>{{ model.data.description }}</p>
      {% endif %}
      {% if model.data.memes or model.data.themes %}
      <div class="catalog__tags">
        {% for memeSlug in model.data.memes or [] %}
          {% set memeEntry = collections.memes | findByFileSlug(memeSlug) %}
          {% if memeEntry %}
          <a class="chip" href="{{ memeEntry.url }}">{{ memeEntry.data.title or memeEntry.fileSlug }}</a>
          {% else %}
          <a class="chip" href="/meme/{{ memeSlug }}/">{{ memeSlug }}</a>
          {% endif %}
        {% endfor %}
        {% for themeSlug in model.data.themes or [] %}
          {% set themeEntry = collections.themes | findByFileSlug(themeSlug) %}
          {% if themeEntry %}
          <a class="chip chip--theme" href="{{ themeEntry.url }}">{{ themeEntry.data.title or themeEntry.fileSlug }}</a>
          {% else %}
          <a class="chip chip--theme" href="/theme/{{ themeSlug }}/">{{ themeSlug }}</a>
          {% endif %}
        {% endfor %}
      </div>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
