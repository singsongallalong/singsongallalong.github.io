---
layout: base.njk
title: Training compute budgets
permalink: /theme/{{ page.fileSlug }}/
description: How available compute and data budgets shape the models we build.
---

As compute scales up, researchers revisit familiar architectures to see how they behave with more data, larger batches, or longer training schedules. This theme captures analyses and models motivated by the practical realities of the training budget.

{% set related = collections.papers | filterByTheme(page.fileSlug) %}
{% if related | length %}
## Models connected to this theme
<ul class="link-list">
  {% for model in related %}
  <li><a href="{{ model.url }}">{{ model.data.title or model.fileSlug }}</a></li>
  {% endfor %}
</ul>
{% endif %}
