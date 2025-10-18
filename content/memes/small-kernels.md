---
layout: meme.njk
title: "small-kernels"
permalink: /meme/{{ page.fileSlug }}/
description: The use of consistently small convolution kernels
concepts: []
---

Another ([[vgg-rule]]) rule which may be attributed to [[paper:VGGnet]]. The use of consistently small kernels, often 3x3 (or 3 for conv1d): "The image is passed through a stack of convolutional (conv.) layers, where we use filters with a very small [[theme:receptive field]]: 3x3 (which is the smallest size to capture the notion of left/right, up/down, center)." (VGGnet paper, p. 2).

As for the motivation: "we use very small 3x3 receptive fields throughout the whole net, which are convolved with the input at every pixel (with stride 1). It is easy to see that a stack of two 3x3 conv. layers (without spatial pooling in between) has an effective receptive field of 5x5; three such layers have a 7x7 effective receptive field. So what have we gained by using, for instance, a stack of three 3x3 conv. layers instead of a single 7x7 layer? First, we incorporate three non-linear rectification layers instead of a single one, which makes the decision function more discriminative. Second, we decrease the number of parameters: assuming that both the input and the output of a three-layer 3x3 convolution stack has C channels, the stack is parametrised by $3 (3^2C^2) = 27C^2$ weights; at the same time, a single 7x7 conv. layer would require $7^2C^2 = 49C^2$ parameters, i.e. 81% more. This can be seen as imposing a regularisation on the 7x7 conv. filters, forcing them to have a decomposition through the 3x3 filters (with non-linearity injected in between)." (VGGnet paper, pp. 2-3).

The small-kernels meme can be thought of as a way of maximizing nonlinearity (depth) subject to certain minimal constraints on the layout of the kernel (isotropy, nontriviality, supported in every direction: which is another way of reiterating the first two points together). It naturally appears quite often with [[residual]] because of the support for deeper nets provided by that meme.
