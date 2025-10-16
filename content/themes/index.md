---
layout: base.njk
title: Themes
permalink: /theme/
eleventyExcludeFromCollections: true
---
# Themes

Themes capture broader narratives around how models are created, evaluated, and deployed.

<div class="catalog" data-catalog="theme">
  <div class="catalog__controls">
    <label class="catalog__control">
      <span>Search</span>
      <input type="search" data-filter-text placeholder="Search themes…">
    </label>
  </div>
  <ul class="catalog__list" data-catalog-list>
    {% for theme in collections.themes | sortByTitle %}
    <li class="catalog__item">
      <h3><a href="{{ theme.url }}">{{ theme.data.title or theme.fileSlug }}</a></h3>
      {% if theme.data.description %}
      <p>{{ theme.data.description }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
