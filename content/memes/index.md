---
layout: base.njk
title: Memes
---
# Memes
<ul>
{% for m in collections.memes %}
  <li><a href="{{ m.url }}">{{ m.data.title or m.fileSlug }}</a></li>
{% endfor %}
</ul>
