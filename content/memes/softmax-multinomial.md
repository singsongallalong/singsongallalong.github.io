---
layout: meme.njk
title: "softmax-multinomial"
permalink: /meme/{{ page.fileSlug }}/
description: Substitution of a continuous valued R.V. with a discrete-support R.V. 
concepts: []
---
	
A classification problem is modeled as emitting a multinomial distribution on a finite range of values (often the full set of labels, but sometimes less, when a problem that emites e.g. floating point values is treated as a classification problem by discretizing the fpvs to live on a smaller output range, used in [[paper:wavent]]). A log-likelihood loss is then used. Very common early on. The multinomial distribution in this structural cliche is always emitted by a softmax layer.
