---
layout: papers/_include/post.njk
title: "Pixel Recurrent Neural Networks"
permalink: /model/{{ page.fileSlug }}/
date: 2016-01-01
description: An autoregressive image model that explored diagonal recurrence and multi-scale conditioning.
memes:
  - idiotropy
  - sequence-inductive-bias
themes:
  - architecture-search
ancestors:
  - lstm
---

PixelRNN framed image generation as a sequence problem by factorising the joint distribution over pixels into a product of conditional distributions. The paper investigated several recurrent layouts—including diagonal and zig-zag sweeps—that broke from the canonical row-major traversal and embodied [[idiotropy]].

The authors coupled the recurrent stack with auxiliary input-to-state connections and row LSTMs, demonstrating that architectural tweaks dramatically affected sample quality. Their ablations capture the spirit of the "architecture search in practice" theme: iterate on building blocks until the training curves and samples finally move.
