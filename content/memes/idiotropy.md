---
layout: base.njk
title: "Idiotropy"
permalink: /meme/{{ page.fileSlug }}/
description: Unusual traversal orders or structural biases that deliberately break canonical symmetries.
---

## Idiotropy

I do not know if this word has been coined yet, but I did not find a suitable word for what I wanted to capture in this notion.
There are many cases where there a system is oriented in a usual, canonical, or inoffensive direction. The impetus for this meme
came from PixelRNN, where horizontal or row-wise LSTM units are used to scan the image left to right, top to bottom. This is what I would call an inoffensive or canonical, uninteresting choice of traversal. It is a reasonable choice anyone would jump to.
On the other hand, diagonal LSTM are employed in PixelRNN, which proceed in a skew direction with respect to the axes of the image. In my ignorance, I picked 'idiotropy' as a suitable label for this sort of phenomenon: an unusual (contextually defined) anisotropy.

{% set related = collections.papers | filterByMeme(page.fileSlug) %}
{% if related | length %}
## Models featuring this meme
<ul class="link-list">
  {% for model in related %}
  <li><a href="{{ model.url }}">{{ model.data.title or model.fileSlug }}</a></li>
  {% endfor %}
</ul>
{% endif %}
