---
layout: meme.njk
title: "autoregression"
permalink: /meme/{{ page.fileSlug }}/
description: Sequential modeling of a joint probability by using the tower rule for conditional probaiblities
concepts: []
---
	
Autoregression is an important if elementary technique where the chain rule for probabilities is employed to rewrite a joint probability as a product of probabilities which form a 'chain': we rewrite $p(x,y,z)$ as $p(x | y, z) p(y | z) p(z)$, and so on for larger sets of variables or sequences. The relevance of this technique is that it allows us to apply sequential modeling to otherwise quite 'opaque' joint probabilities, and there is often an inductive bias suggesting that a sequential model can more accurately describe the underlying data. For example, we tend to think strong relations exist between nearby pixels in an image. We then parametrically model the conditional probabilities using a network and usually log-likelihood loss. It is often convenient to apply [[discretization]] the output data with e.g. a multinomial distribution so as to make for easy calculation of the log-likelihood loss, but it is not necessary as sometimes thought, but since the output of the network is a learned probability distribution/mass function, it requires a different sort of loss than e.g. an $L^2$ or $L^1$ loss on output vectors.
