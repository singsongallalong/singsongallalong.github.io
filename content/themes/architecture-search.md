---
layout: base.njk
title: Architecture search in practice
permalink: /theme/{{ page.fileSlug }}/
description: Exploratory work that tweaks model structure to unlock new capabilities.
---

Many influential models arrive alongside a story about extensive architecture exploration. This theme tracks papers where the authors experimented with layers, recurrence, or connectivity patterns until an unexpected structure made the idea click.

{% set related = collections.papers | filterByTheme(page.fileSlug) %}
{% if related | length %}
## Models connected to this theme
<ul class="link-list">
  {% for model in related %}
  <li><a href="{{ model.url }}">{{ model.data.title or model.fileSlug }}</a></li>
  {% endfor %}
</ul>
{% endif %}
