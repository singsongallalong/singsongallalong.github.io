---
layout: papers/_include/post.njk
title: "Resnet"
permalink: /model/{{ page.fileSlug }}/
date: 2015-12-10
description: Primary progenitor in the use of residual layers
memes:
  - residual
  - vgg-rule
themes:
  - trainability
  - architecture
ancestors: ['VGGnet']
---

'Deep Residual Learning for Image Recognition' by He et al: https://arxiv.org/pdf/1512.03385. Residual layers are ubiquitous today. This is really the model that started a lot of it. The core themes in this paper are [[theme:trainability]] and [[theme:architecture]], and the relationship between the two is their impetus for the entire paper. Ideally, one could create an increasingly capacious and expressive model simply by stacking more layers on top of one another. The issue the authors faced was that there was a point of depth past which deep networks started to perform worse empirically in terms of both training and test error. The fact that both test and training error were similarly poor indicates that obviously it was not a matter of merely overfitting: [[theme:bias-variance]] is decidedly *not* the primary theme of the paper. [[theme:Trainability]] is something like the intersection between modeling decisions and optimization concerns. In this case, the belief was that more or less SGD was not working well on the deep models they were trying to train, so they wanted to adjust the models to be more susceptible.

If an $n$-layer deep model can solve the problem relatively well, then if we append one more layer to it, a decent guess (at least, a *no-worse* guess) for the next layer's initial configuration (initial weights) is simply for it to do nothing at all to the result. With linear layers, it's easy to describe a $0$-mapping as simply one with all weights set to $0$ (no bias and no correlations). So if we write formulate our new layer as adding something to the output of the last layer, then we can easily start at a near no-op configuration just by setting our weights to near zero. Hence the birth of the elementary [[residual]] layer, which works if the output is of the same shape as the input:

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

which are the three sorts of cases one encounters. The utility of a residual layer is in the complexity gap between the 'proj' layer and the 'block' layer. The two each on their own may be of arbitrary complexity, but the gap is what is hypothetically important. If a linear network is fit to some data and then used as an initialization for a skip in such a residual layer while a near-zero initialization is used for the more complex and non-linear block, the idea is that the network starts from a place no-worse at least than the linear guess/initialization. I only belabor this topic so much because I think that it explains the utility of skips: gluing models together in a way where one already works pretty alright [B]. One could also think of it as a very simple ensemble (on the individual residual layer), analogous to boosting.

In resnet, the primary type of blocks are convolutional blocks and the up skips are $1 \times 1$ convolutions. There are two methods of projecting downward: the same as for going up, and truncating the tensor to fit the smaller shape. Downsampling is performed by stride, a common technique in convnets. The average filter size is $3 \times 3$. The residual network used for ablation testing against a plain network is $34$ layers deep and unsurprisingly to our modern vantage point, it outperforms both VGG and the plain network used for comparsion. The task given to resnet is classification as per the ImageNet 2012 dataset. It scored top-$5$ err. 3.57 against VGG's $7.32$. Bottlenecks are employed for resource reasons: a bottleneck layer is one which sandwiches a 'complex' layer between two simple ones which reduce and then increase the dimension, giving a lower dimensional space for the 'complex' layer to work on:

```python
block_bottleneck = 
	nn.Sequential(
		nn.Conv1d(8, 4, 1), # 'simple layer': kernel is size 1, reduces dim
		nn.Conv1d(4, 4, 3), # 'complex' layer: kernel is size 3
		nn.Conv1d(4, 8, 1)  # 'simple layer': kernel is size 1, increases dim
		) # same number of ins/outs, requires no 'projection'/injection
		
res_mid = Residual(block_bottleneck)
```

which is useful when a full-scale middle block would be too costly to train. There is some good empirical support in the paper for the fact that optimizers do end up with residual layers producing smaller modifications to outputs rather than being of comparable size to early layers. A structural meme inherited from VGG nets is the use of what are called two 'simple rules' in the paper: "(i) for the same output feature map size, the layers have the same number of filters; and (ii) if the feature map size is halved, the number of filters is doubled so as to preserve the time complexity per layer," p. 3, the [[vgg-rule]]. Logic of this sort is often the rule in convnet design, for the reason stated: "so as to preserve the time complexity per layer." Resblocks are a standard tool when building convnets, consisting of stacks of bottlenecks or normal layers with residual connections, piled on top of eachother. Despite being considerably simpler numerically, the resnets outperformed VGGnets and competitors of their day, which is a testament to the importance of nonlinearity and depth. 

## Footnotes

[A] They call it a projection. To me, a projection is an idempotent linear operator. 

[B] TODO: elaborate on the connection to Taylor series expansions
