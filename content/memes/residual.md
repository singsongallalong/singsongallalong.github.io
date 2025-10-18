---
layout: meme.njk
title: "residual"
permalink: /meme/{{ page.fileSlug }}/
description: Use of identity or simple skips to formulate a network as correcting an ideally small error
concepts: []
---

Residuals are a way to formulate the learning of $x \rightarrow H(x)$ as the learning of $x - H(x)$, known as the 'residual'. The motivation lies in the superior [[theme:trainability]] of such a problem.
	
If an $n$-layer deep model can solve the problem relatively well, then if we append one more layer to it, a decent guess (at least, a *no-worse* guess) for the next layer's initial configuration (initial weights) is simply for it to do nothing at all to the result. With linear layers, it's easy to describe a $0$-mapping as simply one with all weights set to $0$ (no bias and no correlations). So if we write formulate our new layer as adding something to the output of the last layer, then we can easily start at a near no-op configuration just by setting our weights to near zero. Hence the birth of the elementary residual layer, which works if the output is of the same shape as the input:

```python
class Residual(nn.Module):
	def __init__(self, block):
		super().__init__()
		self.block = block
	
	def forward(self, x):
		return x + self.block(x)
```

which is a very straightforward wrapper. Now "layer" just calculates an additive modification to its input. Of course, when input shapes differ from output shapes, some kind of transformation [A] on the input is required:

```python
class Residual(nn.Module):
	def __init__(self, block, skip):
		super().__init__()
		self.block = block
		self.skip = skip if skip is not none else: nn.Identity()
	
	def forward(self, x):
		return self.skip(x) + self.block(x)
		
# nontrivial proj

block_in = nn.Sequential(nn.Conv1d(1, 2, 3), nn.Conv1d(2, 4, 3), nn.Conv1d(4, 8, 3)) # the output has eight channels, the input has one channel
skip_up = nn.Conv1d(1, 8, 1) 
res_in = Residual(block_in, skip)

block_mid = nn.Sequential(nn.Conv1d(8, 8, 3), nn.Conv1d(8, 8, 3), nn.Conv1d(8, 8, 3)) # same number of ins/outs, requires no 'projection'/injection
res_mid = Residual(block_mid)

block_down = nn.Sequential(nn.Conv1d(8, 4, 3), nn.Conv1d(4, 2, 3), nn.Conv1d(2, 1, 3)) # less outs than ins, 'projection' required
skip_down = nn.Conv1d(8, 1, 1)
res_down = Residual(block_down, skip_down)
```

which are the three sorts of cases one encounters. The utility of a residual layer is in the complexity gap between the 'proj' layer and the 'block' layer. The two each on their own may be of arbitrary complexity, but the gap is what is hypothetically important. If a linear network is fit to some data and then used as an initialization for a skip in such a residual layer while a near-zero initialization is used for the more complex and non-linear block, the idea is that the network starts from a place no-worse at least than the linear guess/initialization. I only belabor this topic so much because I think that it explains the utility of skips: gluing models together in a way where one already works pretty alright. One could also think of it as a very simple ensemble (on the individual residual layer), analogous to boosting.

TODO: add notes on Taylor series
