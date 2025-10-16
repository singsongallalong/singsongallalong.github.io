---
layout: papers/_include/post.njk
title: "Long Short-Term Memory"
permalink: /model/{{ page.fileSlug }}/
date: 1997-12-15
description: The recurrent cell design that stabilised gradient flow and made sequence modelling practical.
memes:
  - sequence-inductive-bias
themes:
  - training-compute
descendants:
  - pixelrnn
---

Sepp Hochreiter and Jürgen Schmidhuber's long short-term memory (LSTM) network introduced gating to control information flow in a recurrent cell. By separating the cell state from the hidden state, they mitigated exploding and vanishing gradients while retaining the ability to model long dependencies.

The design inspired decades of sequence models, from speech recognition to machine translation. It also encouraged researchers to think about the explicit inductive biases introduced by recurrence—what we now tag as the [[sequence-inductive-bias]] meme.
