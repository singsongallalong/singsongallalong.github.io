---
layout: base.njk
title: Concepts
permalink: /concept/
eleventyExcludeFromCollections: true
---
# Concepts

Concepts are reflections on memes, and are intended to group various memes and also subconcepts into hierarchies.

<div class="catalog" data-catalog="concept">
  <div class="catalog__controls">
    <label class="catalog__control">
      <span>Search</span>
      <input type="search" data-filter-text placeholder="Search concepts…">
    </label>
  </div>

  <ul class="catalog__list" data-catalog-list>
    {% for concept in collections.concepts | sortByTitle %}
    <li class="catalog__item">
      <h3><a href="{{ concept.url }}">{{ concept.data.title or concept.fileSlug }}</a></h3>

      {# show parent chips #}
      {% if concept.data.parents %}
      <p class="catalog__meta">
        Parents:
        {% for pslug in concept.data.parents %}
          {% set parent = collections.concepts | findByFileSlug(pslug) %}
          {% if parent %}
            <a class="chip chip--concept" href="{{ parent.url }}">{{ parent.data.title or parent.fileSlug }}</a>
          {% else %}
            <a class="chip chip--concept" href="/concept/{{ pslug }}/">{{ pslug }}</a>
          {% endif %}
        {% endfor %}
      </p>
      {% endif %}

      {% if concept.data.description %}
      <p>{{ concept.data.description }}</p>
      {% endif %}

      {# counts (children + memes) #}
      {% set slug = concept.fileSlug %}
      {% set childCount = 0 %}
      {% for other in collections.concepts %}
        {% for p in other.data.parents or [] %}
          {% if p == slug %}
            {% set childCount = childCount + 1 %}
          {% endif %}
        {% endfor %}
      {% endfor %}

      {% set memeCount = 0 %}
      {% for m in collections.memes %}
        {% for cslug in m.data.concepts or [] %}
          {% if cslug == slug %}
            {% set memeCount = memeCount + 1 %}
          {% endif %}
        {% endfor %}
      {% endfor %}

      {% if childCount or memeCount %}
      <p class="catalog__meta">
        {% if childCount %}
          {{ childCount }} {% if childCount == 1 %}subconcept{% else %}subconcepts{% endif %}
        {% endif %}
        {% if childCount and memeCount %} • {% endif %}
        {% if memeCount %}
          {{ memeCount }} {% if memeCount == 1 %}meme{% else %}memes{% endif %}
        {% endif %}
      </p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
