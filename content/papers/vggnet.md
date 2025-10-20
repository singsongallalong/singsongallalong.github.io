---
layout: papers/_include/post.njk
title: "VGGnet"
permalink: /model/{{ page.fileSlug }}/
date: 2015-04-10
description: Important architectural predecessor to modern deep convnets
memes:
  - vgg-rule
  - convolution
  - relu
  - weight-decay
  - small-kernels
themes:
  - depth
  - architecture
ancestors: ['alexnet']
---

"Very Deep Convolutional Networks for Large-Scale Image Recognition," Simonyan and Zisserman, https://arxiv.org/pdf/1409.1556. Named after the "Visual Geometry Group" at Oxford, this paper introduces two important architectural memes: [[small-kernels]] and [[vgg-rule]]. The primary theme in this paper is [[theme:depth]], and the architectural memes are induced as a tool to that end. Namely, when we are going for a deeper convolutional net, what structural cliches and rules we can use to guide us in selection of kernel sizes and depth? The basic hypothesis that motivates VGGnet in this regard is [[hypothesis:small-kernel-depth-efficiency]] combined with a quite logical rule: when the next layer changes in some way, for example, in spatial resolution, the number of filters is adjusted to keep time-complexity the same. The idea is that we have a certain throughput of compute and we want to change it only when we decide it is good to do so, e.g. when we need to speed up the network. One common cliche that occurs in the case when we do want to speed up the network is the use of [[bottleneck]] layers, which were not introduced or used in VGGnet. The [[hypothesis:small-kernel-depth-efficiency]] hypothesis is essentially the idea that deeper conv stacks with smaller kernels are superior to shallower nets with larger kernels. Some evidence from the paper:

{% evidence "small-kernel-depth-efficiency" %}
In total, the learning rate was decreased 3 times, and the learning was stopped after 370K iterations (74 epochs). We conjecture that in spite of the larger number of parameters and the greater depth of our nets compared (Krizhevsky et al., 2012) ([[alexnet]]), the nets required less epochs to converge due to (a) implicit regularisation imposed by greater depth and smaller conv. filter sizes; (b) pre-initialisation of certain layers.
{% endevidence %}

{% evidence "small-kernel-depth-efficiency" %}
We also compared the net B with a shallow net with five 5x5 conv. layers, which was derived from B by replacing each pair of 3x3 conv. layers with a single 5x5 conv. layer (which has the same receptive field as explained in Sect. 2.3). The top-1 error of the shallow net was measured to be 7% higher than that of B (on a center crop), which confirms that a deep net with small filters outperforms a shallow net with larger filters.
{% endevidence %}

Like [[paper:alexnet]] the final three layers are fully-connected and [[softmax-sampling]] is used to actually calculate the output prediction. Basically the entire head (final section) of the network is taken from [[paper:alexnet]] down to the numbers. As in [[paper:alexnet]], the dense layers at the end take up most of the parameter-count.
