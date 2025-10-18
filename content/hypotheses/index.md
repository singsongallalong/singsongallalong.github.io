---
layout: base.njk
title: Hypotheses
permalink: /hypothesis/
eleventyExcludeFromCollections: true
---
# Hypotheses

I maintain a list of loose hypotheses, e.g. predictions / expectations, and track (solely empirical) evidence as I find it. It is my belief (hypothesis!) that empirical evidence is more important than theoretical ideas about performance or behavior of networks. 

<div class="catalog" data-catalog="hypothesis">
  <div class="catalog__controls">
    <label class="catalog__control">
      <span>Search</span>
      <input type="search" data-filter-text placeholder="Search hypotheses…">
    </label>
  </div>
  <ul class="catalog__list" data-catalog-list>
    {% for hypothesis in collections.hypotheses | sortByTitle %}
    <li class="catalog__item">
      <h3><a href="{{ hypothesis.url }}">{{ hypothesis.data.title or hypothesis.fileSlug }}</a></h3>
      {% if hypothesis.data.description %}
      <p>{{ hypothesis.data.description }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
