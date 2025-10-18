---
layout: meme.njk
title: "relu"
permalink: /meme/{{ page.fileSlug }}/
description: Rectified linear units
concepts: []
---

A simple and common nonlinearity: $x \rightarrow \operatorname{max}(x, 0)$. A quote from [[paper:alexnet]] on the use of ReLU units: "Deep [[convolution]]al neural networks with ReLUs train several times faster than their equivalents with tanh units. This is demonstrated in Figure 1, which shows the number of iterations required to reach 25% training error on the CIFAR-10 dataset for a particular four-layer convolutional net
work. This plot shows that we would not have been able to experiment with such large neural networks for this work if we had used traditional saturating neuron models."

The primary feature of ReLUs is their lack of issues with gradient propagation near [[theme:saturation]]: in the active region, the gradient of a ReLU unit is constant, so it does not suffer from the gradients becoming very small as $|x| \rightarrow \infty$, therefore they are less dependent upon normalization of their inputs.
