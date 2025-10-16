---
layout: base.njk
title: Themes
---
# Themes
<ul>
{% for t in collections.papers %}
  <li><a href="{{ t.url }}">{{ t.data.title or t.fileSlug }}</a></li>
{% endfor %}
</ul>
