---
layout: base.njk
title: "Sequence inductive bias"
permalink: /meme/{{ page.fileSlug }}/
description: Architectural choices that bake directional or temporal order directly into the model.
---

The architecture leans on the assumption that inputs arrive in a meaningful order. The model's operations explicitly encode that order into its computation graph—for example by reusing hidden states across time or space, or by conditioning each step on past activations.

{% set related = collections.papers | filterByMeme(page.fileSlug) %}
{% if related | length %}
## Models featuring this meme
<ul class="link-list">
  {% for model in related %}
  <li><a href="{{ model.url }}">{{ model.data.title or model.fileSlug }}</a></li>
  {% endfor %}
</ul>
{% endif %}
