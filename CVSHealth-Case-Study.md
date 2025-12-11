---
layout: default
title: CVSHealth Botnet Shield Case Study
---
# CVSHealth Botnet Shield Case Study

A significant portion of modern web traffic consists of malicious activity, including credential stuffing, DDoS attacks, card testing, and large-scale scraping. These threats lead to costly problems such as fraud, account takeovers, and data breaches. This case study describes the implementation of a machine learning system designed to detect and block automated malicious requests targeting customer-facing endpoints, while safeguarding legitimate user experience and platform availability.
![overview](assets/CVS-case-study/overview.jpg)

<br>
## Use Case and Desired Outcome

The project’s aim was to distinguish and block automated malicious traffic from legitimate human users by leveraging HTTP header features, such as user agents, referrer URLs, authentication tokens, and cookies. The system’s primary goals were to reduce fraud incidents, prevent account takeovers, limit scraping, and free the cybersecurity team up to focus on proactive threat hunting, all without interrupting legitimate customer access.

<br>
## Business Alignment

Attacks against CVS Health’s online infrastructure lead to direct financial losses from fraud and account compromises, along with inflated infrastructure costs due to excessive bot traffic. Automating malicious traffic detection mitigates these losses, reduces manual investigations, and lowers costs from unnecessary scaling. More importantly, it protects customer accounts, helping to maintain trust; a key operational priority for the business.


![old-system](assets/CVS-case-study/old-system.jpg) 

![enhanced-system](assets/CVS-case-study/enhanced-system.jpg)

<br>
## Plan of Attack

The team began by selecting endpoints from a cybersec-provided list of over 100, ranked by traffic volume. Endpoints were filtered to those with sufficient data for training but manageable scope for initial testing, resulting in seven online shopping-related endpoints. Years of traffic data were available, along with the blocking rules that had been put in place by the cybersecurity team tagging traffic as malicious.

We set out to query some test data. In fact our feature engineering process was quite a task in itself. All available traffic header information was concatenated into one long string. The objective of the next few steps was to obtain a dense vector representation of the concatenated string using a language model. Bearing in mind that these strings were not English, but a mix of words, symbols, and numbers, a subset of these data was taken and used to train a SentencePiece tokenizer. This allowed efficient tokenization of the concatenated strings. With the strings tokenized, the same corpus was used to train a small language model, which was in turn used to obtain vector embeddings.

Proof of concept feasibility models applied dimensionality reduction methods on the unlabeled vector embeddings, with labels applied afterwards to reveal separable malicious clusters. The embeddings were projected into UMAP space, historical labels overlaid post-hoc, and cluster separation quantified via silhouette scores demonstrated a potential 20-30% malicious traffic detection rate improvement.  

​With the feasibility of unsupervised classification proven, data pipelines for six months of training data were prepared for each of the seven endpoints. At the same time, a variational autoencoder deep learning model was built, and training and hyperparameter tuning pipelines were set up for each of the seven endpoints. Trained models were tracked in MLFlow, and deployed and served with Databricks' Model Serving service.

![model-details](assets/CVS-case-study/model-details.jpg)

<br>
## Success and Challenges

UMAP visualizations showed distinct latent space regions dominated by malicious traffic (>90% purity in top clusters via post-hoc labels), confirming embeddings captured separable signals for variational autoencoder anomaly detection. Production models, each trained for a specific endpoint on six months of data and served with Databricks, integrated successfully into Splunk with phased rollout, providing real-time bot scores for security triage.

Unfortunately, some advanced bots fell into ambiguous latent regions, evading high reconstruction error thresholds. Seasonal traffic surges (e.g., promotions) may have produced false anomalies; this will require a deeper look into threshold tuning.

<br>
## What Worked Well

- Unsupervised UMAP PoCs provided rapid visual proof, expediting stakeholder buy-in.​
- Model metrics displayed on realtime dashboards also gained stakeholder buy-in while supporting the case for regular model retraining.
- Feature engineering blending header information signals outperformed manual rulesets.

<br>
## Issues Faced

- Large size of training data required careful design of feature engineering processes and tradeoffs between simplicity, speed, reliability, and cost.
- Endpoint prioritization tradeoffs caused scope creep frustration.
- Traffic surges were sometimes interpreted as bots.
- Tensions arose between blocking aggressiveness and allowing potential legitimate human users.

<br>
## Takeaways

- Using unsupervised learning can provide a model with flexibility beyond the story labeled data tells. This approach excels for zero-day threats and drift in adversarial domains.    
- Visual demonstrations (UMAP visualizations) build security team trust faster than purely numerical metrics.​
- Ongoing model monitoring and retraining are essential as attackers are constantly evolving.
- Building in a human feedback loop alongside a continuous learning ML feedback loop is a very powerful system design to constantly improve an ML model.
- SentencePiece tokenizers can be trained to tokenize arbitrary byte-like or text-like data, making them suitable for mixed header fields.
