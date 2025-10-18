---
layout: papers/_include/post.njk
title: "Alexnet"
permalink: /model/{{ page.fileSlug }}/
date: 2012-12-03
description: Primary early deep convolutional neural net for use in images 
memes:
  - convolution
  - relu
  - local-response-normalization
  - dropout
  - weight-decay
themes:
  - compute-resources
ancestors: []
---

"ImageNet Classification with Deep Convolutional Neural Networks," Krizhevsky et al., https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf. I will not write an extended exposition on this paper because it is sufficiently old to mostly consist of well-trodden ground. The architecture is all that I will write about and mostly for recording purposes. The nonlinearities used are exclusively [[relu]] units, which would become an important structural meme in many [[convolution]]-nets, popularized by this paper. The network is situated so that the first five layers are convolutional, the last three are fully connected, and the output is given to a softmax over the resulting $1000$-long vector (a case of the ubiquitous [[softmax-sample]]). Normalization follows convolutional layers one and two, and the normalization is [[local-response-normalization]], which was introduced in this paper. The convolutional layers look like (this implementation is not faithful due to the split GPU training in the original, but the layers are summarized here):

```python
convnet = nn.Sequential(
	nn.Conv2d(3, 96, 3, stride=4), #first layer 
	nn.LocalResponseNorm(5, alpha=0.0001, beta=0.75, k=2),
	nn.ReLU(),
	nn.MaxPool2d(3, stride=2), 
	nn.Conv2d(96, 256, 5), # second layer
	nn.LocalResponseNorm(5, alpha=0.0001, beta=0.75, k=2) 
	nn.ReLU(),
	nn.MaxPool2d(3, stride=2), 
	nn.Conv2d(256, 384, 3), # third layer 
	nn.ReLU(),
	nn.Conv2d(384, 384, 3), # fourth layer 
	nn.ReLU(),
	nn.Conv2d(384, 256, 3), # fifth layer 
	nn.ReLU(),
	nn.MaxPool2d(3, stride=2),
	nn.Flatten(),
	nn.Linear(256 * 6 * 6, 4096),
	nn.ReLU(),
	nn.Linear(4096, 4096),
	nn.ReLU(),
	nn.Linear(4096, 1000),
	nn.ReLU(),
	nn.Softmax()
)
```

although the original network had an interesting configuration involving splitting work between GPUs and then reconnecting the effectively decoupled nets in the dense nets, an instance of [[theme:compute-resources]] being an important motivator in the design of the network. At the time, resources were much sparser than they are today, so the clever use of compute is commendable, if not too interesting from the present day point of view. The choice of dimensions for the convolutional nets seems quite arbitrary, as far as I can tell, potentially motivated again by [[theme:compute-resources]] or [[theme:trainability]]. 

[[Dropout]] and [[weight-decay]] are used. For decay: "We trained our models using stochastic gradient descent with a batch size of $128$ examples, momentum of $0.9$, and weight decay of $0.0005$. We found that this small amount of weight decay was important for the model to learn. In other words, weight decay here is not merely a regularizer: it reduces the model’s training error."

The remaining architectural detail to note is that the linear layers take up the vast majority of the actual parameter-count. We have: {% evidence "convolution-efficiency, depth-efficiency" %} "our final network contains five convolutional and three fully-connected layers, and this depth seems to be important: we found that removing any convolutional layer (each of which contains no more than 1% of the model’s parameters) resulted in inferior performance." (p. 2)  {% endevidence %} 

This fact suggests that the [[theme:inductive-bias]] and/or superior [[theme:trainability]] of convolutional layers made them comparatively very parameter-efficient, which is an unsurprising conclusion to the modern reader.

I will set the rest of the paper aside, excepting one particular. There is a very, very interesting figure I find worth discussing. The authors themselves state: {% evidence "soc-efficiency" %} "Notice the specialization exhibited by the two GPUs, a result of the restricted connectivity described in Section 3.5. The kernels on GPU 1 are largely color-agnostic, while the kernels on on GPU 2 are largely color-specific. This kind of specialization occurs during every run and is independent of any particular random weight initialization (modulo a renumbering of the GPUs)." 

![Alexnet kernel comparison](/images/alexnet-kernel-comp.png)
{% endevidence %}

I find this phenomenon quite interesting. The effective specialization of partially isolated subnetworks is strikingly displayed visually. 
