---
layout: base.njk
title: Models
---
# Models
<ul>
{% for p in collections.papers %}
  <li><a href="{{ p.url }}">{{ p.data.title or p.fileSlug }}</a></li>
{% endfor %}
</ul>
