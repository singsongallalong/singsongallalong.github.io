---
layout: meme.njk
title: "multiscale"
permalink: /meme/{{ page.fileSlug }}/
description: The processing or representation of data along multiple scales
concepts: ['hierarchical']
---
	
The processing or representation of data along multiple scales. For example, progressively subsampling an image until it is a single pixel (akin to a mipmap) would constitute multiple scales of consideration, but so could using different models for fine and coarse time-details of a signal. The wavelet transform is a classical example of multiscale processing, as are multigrid methods. Multiscale methods (rather than e.g. anisotropic methods which treat different directions independently) are inherently [[concept:hierarchical]].

{% set related = collections.papers | filterByMeme(page.fileSlug) %}
{% if related | length %}
## Models featuring this meme
<ul class="link-list">
  {% for model in related %}
  <li><a href="{{ model.url }}">{{ model.data.title or model.fileSlug }}</a></li>
  {% endfor %}
</ul>
{% endif %}
