---
layout: papers/_include/post.njk
title: "Pixelcnn++"
permalink: /model/{{ page.fileSlug }}/
date: 2017-01-19
description: Very strong early convnet that was the backbone for the first diffusion nets
memes:
  - convolution
  - relu
  - small-kernels
  - transposed-convolution
  - unet-skips
  - ushape
  - dropout 
  - elu
  - logmix
themes:
  - trainability
ancestors: ['gated-pixelcnn', 'unet', 'resnet', 'kingma-vae']
---

Status: first draft and needs a second passover. 

"PixelCNN++: Improving the PixelCNN with Discretized Logistic Mixture Likelihood and Other Modifications," Salimans, Karpathy, Chen, and Kingma, https://arxiv.org/pdf/1701.05517. This paper focuses on a generative model based on [[paper:pixelrnn]], specifically the *convolutional* model considered in that paper [A]. The eponymous contribution of the paper is rewriting the model used at the head: instead of using a [[softmax-sampling]] over a $256$ dimensional vector, they model a distribution as a mixture of logistic distributions ([[logmix]]) for the output of the model. In such a model it is assumed that each pixel's color intensity is a truncation or nearest-neighbor-discretization (pick the nearest value on a grid to a given continuous value) of a continuous sample from a random variable distributed as a mixture of logistic distributions: 

$$c \sim \Sigma^N_{i=1} \alpha_i \operatorname{logistic}(\mu_i, s_i)$$

and if we assume $x$ results from rounding $c$ to the nearest integer in the $(0, 255)$ we get:

$$P(x=x_0|\alpha, \mu, s) = P(c \in (x_0 - 0.5, x_0 + 0.5) | \alpha, \mu, s) = \Sigma^N_{i=1} \alpha_i [\sigma(x_0 + 0.5 - \mu_i)/s_i] - \sigma((x_0 - 0.5 - \mu_i)/s_i)].$$

When $x_0=0$, $x-0.5$ is replaced by $-\infty$ and likewise with $x+0.5 \rightarrow \infty$ for $x_0=255$ (which follows from the $\sigma$ sigmoid function being the CDF of the standard logistic distribution). This model of likelihoods for inference essentially goes back to the VAE literature and [[paper:kingma-vae]] is the direct inspiration in this paper for the approach. The purpose of the $\pm\infty$ identifications is to reflect the way a lot of different potential intensity values are being clamped down into a finite range when we take discrete representation of a continuous distribution of intensities, or to reflect that our discretization is essentially too small both in resolution (minimum distance between points in our grid) and breadth (maximal distance between points in our grid). In the model, they wind up using small numbers for $N,$ like $5$. The parameters are emitted for pixel prediction and then a log-likelihood loss is used as usual. The main theme at play in this decision is [[theme:trainability]] due the nature of a discrete distribution not enforcing 'continuity' on the emitted PMF, i.e. if we find that $x=x_0$ is extremely likely, we would think that $x=x_0 \pm 1$ should not be extremely unlikely in general. We expect that the resulting PMF arises from a continuous PDF on continuous intensities (a very weak assumption), which makes this hypothesis reasonable. There are other potential issues with a [[softmax-multinomial]] approach for this purpose but it is particularly troublesome for data which comes from a spectrum because it knows nothing about the order and hence proximity of the data.

[[paper:gated-pixelcnn]] essentially [[autoregressive]]ly decomposed the PMF for an RGB triplet so that first the red values must be obtained at each step using only the prior values (the [[autoregression]] on the sequence of entire pixels being generated), then the green is generated using all the prior pixels + the red value we just generated, then the blue value using the red and green values + the prior pixels again. PixelCNN++ uses a different model where a the green value at a given pixel is not a deep function directly of the red value, but the means of the logistic components are linear in the training-data actual red value with a deep-modeled constant of proportionality: 

$$\mu_g(\mathbold{x}_{<i}, r_i) = \mu_g^*(\mathbold{x}_{<i}) + \alpha(\mathbold{x}_{<i})r_i,$$

and similarly the blue means are linear in the training-data actual red and green pixels. When sampling, one of the logistics in the mixture is chosen and then the sampling occurs sequentially according to this scheme, where the predicted red values are used for modeling the green logistic, and likewise for the predicted RG values for the blue. 

![PixelCN++ Architecture](/images/pixelcnn++-architecture.png)

The architecture is similar to a $paper:unet$, one may turn their attention to the figure above. There are six blocks, three going down and three going up. Strided convolutions are used to downsample, instead of max pools, and [[unet-skips]] are present. Each vertical downward edge consists of $5$ [[paper:resnet]] layers each (so e.g. [[small-kernels]] is inherited from [[paper:vggnet]]); or it should at least! The figure says $6$ layers, but this is seemingly an error, for the source uses $5$ layers. The text itself states the correct number:

> For input of size 32 × 32 our suggested model consists of 6 blocks of 5 ResNet layers. (p. 3)

Skips run from each [[residual]] layer to the corresponding layer on the ascending side, these are the [[unet-skips]]. This split-stream structure was taken from [[paper:gated-pixelcnn]]. The purpose is explained more there, but essentially it was used in a scheme where the rectangle portion of the image already generated, consisting of all rows above the current one, was fed into a different convolutional net than the current row, to which a one dimensional convolution was applied. A similar approach is used in this model:

```python
            xs = nn.int_shape(x)
            x_pad = tf.concat([x,tf.ones(xs[:-1]+[1])],3) # add channel of ones to distinguish image from padding later on
            u_list = [nn.down_shift(nn.down_shifted_conv2d(x_pad, num_filters=nr_filters, filter_size=[2, 3]))] # stream for pixels above
            ul_list = [nn.down_shift(nn.down_shifted_conv2d(x_pad, num_filters=nr_filters, filter_size=[1,3])) + \
                       nn.right_shift(nn.down_right_shifted_conv2d(x_pad, num_filters=nr_filters, filter_size=[2,1]))] # stream for up and to the left
```

and an example of an actual stack of [[residual]] layers:

```python
	for rep in range(nr_resnet):
	u_list.append(nn.gated_resnet(u_list[-1], conv=nn.down_shifted_conv2d))
	ul_list.append(nn.gated_resnet(ul_list[-1], u_list[-1], conv=nn.down_right_shifted_conv2d))

	u_list.append(nn.down_shifted_conv2d(u_list[-1], num_filters=nr_filters, stride=[2, 2]))
	ul_list.append(nn.down_right_shifted_conv2d(ul_list[-1], num_filters=nr_filters, stride=[2, 2]))
```

where the preprocessing is to isolate the two streams into one with larger kernels (filter_size = [2, 3]) which only sees upward pixels and one which sees pixels to the left and the above. This is the cause of the split-stream structure contra the [[paper:unet]] structure. [[Dropout]] is used for regularization due to the high capacity of the model. A variety of activation units are utilized This paper is likely to be revisited for elaboration due to its importance. The default nonlinearity in the code is [[elu]] but [[gated]] layers are being used. 
