---
layout: meme.njk
title: "discretization"
permalink: /meme/{{ page.fileSlug }}/
description: Substitution of a continuous valued R.V. with a discrete-support R.V. 
concepts: []
---
	
Some input or output of the network is given by a probability distribution with discrete support (range of possible values), considerably smaller than the actual range of values that the original data may take on (/is supported on). For example, a multinomial distribution may be chosen with $32$ values in its support to replace a single byte in a $4$-byte RGBA value in an image, each of the $32$ values mapping to one of many more values in a range of $256$ different options the original byte could have taken on. The conversion from the distribution to an actual sample is varied: one may stochastically sample the given P.M.F. genuinely (unusual) or simply take a maximum over the resulting multinomial distribution, taking the most likely option: the [[softmax-sampling]] strategy. An elementary form of compression which readily allows for the calculation of log-likelihoods.
