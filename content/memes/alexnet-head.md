---
layout: meme.njk
title: "softmax-multinomial"
permalink: /meme/{{ page.fileSlug }}/
description: Modeling the output distribution as a multinomial emitted by a softmax 
concepts: []
---
	
A classification problem is modeled as emitting a multinomial distribution on a finite range of values (often the full set of labels, but sometimes less, when a problem that emites e.g. floating point values is treated as a classification problem by discretizing the fpvs to live on a smaller output range, used in [[paper:wavent]]). A log-likelihood loss is then used. Very common early on. The multinomial distribution in this structural cliche is always emitted by a softmax layer. For example ([[paper:alexnet]]):

```python
	nn.Flatten(),
	nn.Linear(256 * 6 * 6, 4096),
	nn.ReLU(),
	nn.Linear(4096, 4096),
	nn.ReLU(),
	nn.Linear(4096, 1000),
	nn.ReLU(),
	nn.Softmax()
```
