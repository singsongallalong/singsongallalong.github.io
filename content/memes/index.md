---
layout: base.njk
title: Memes
permalink: /meme/
eleventyExcludeFromCollections: true
---
# Memes

Browse the catalog of memes to discover the recurring traits that show up across models.

<div class="catalog" data-catalog="meme">
  <div class="catalog__controls">
    <label class="catalog__control">
      <span>Search</span>
      <input type="search" data-filter-text placeholder="Search memes…">
    </label>
  </div>
  <ul class="catalog__list" data-catalog-list>
    {% for meme in collections.memes | sortByTitle %}
    <li class="catalog__item">
      <h3><a href="{{ meme.url }}">{{ meme.data.title or meme.fileSlug }}</a></h3>
      {% if meme.data.description %}
      <p>{{ meme.data.description }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
