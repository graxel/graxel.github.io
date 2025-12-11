# CVSHealth Botnet Shield Case Study

A significant fraction of modern online traffic can be labeled malicious, with attacks spanning from credential stuffing, DDoS, card testing, and scraping. These attacks can result in business losses due to fraud, account takeovers, data leaks, and more. This study implemented a machine learning system to detect and block malicious automated web traffic from customer-serving endpoints, while preserving legitimate user experience and platform uptime.
![[assets/CVS-case-study/overview.jpg]]

## Use Case and Desired Outcome

The goal of this study was to detect and block malicious automated traffic (versus legitimate human users) from hitting company server endpoints using available traffic header features like user agent, referring URL, auth tokens, and cookie headers to enable real-time intervention. The study hoped to achieve a reduction in fraud incidents, account takeovers, and scraping, and free up the cybersecurity team to pursue proactive threat hunting, while still maintaining human user access.

## Business Alignment

Attacks on CVSHealth's server endpoints cause direct revenue losses from fraud and account takeovers, plus higher infrastructure costs from excess traffic volume. Automating botnet blocking reduces these impacts, as well as reducing manual investigations for the cybersecurity team. Furthermore, it cuts costs from abuse-driven scaling and preserved account integrity to limit customer churn, supporting CVS's operational needs.


![[assets/CVS-case-study/old-system.jpg]] 

![[assets/CVS-case-study/enhanced-system.jpg]]

## Plan of Attack

The team began by selecting endpoints from a cybersec-provided list of over 100, ranked by traffic volume. Endpoints were filtered to those with sufficient data for training but manageable scope for initial testing, resulting in seven online shopping-related endpoints. Years of traffic data were available, along with the blocking rules that had been put in place by the cybersecurity team tagging traffic as malicious.

We set out to query some test data. In fact our feature engineering process was quite a task in itself. All available traffic header information was concatenated into one long string. The objective of the next few steps was to obtain a dense vector representation of the concatenated string using a language model. Bearing in mind that these strings were not English, but a mix of words, symbols, and numbers, a subset of these data was taken and used to train a SentencePiece tokenizer. This allowed efficient tokenization of the concatenated strings. With the strings tokenized, the same corpus was used to train a small language model, which was in turn used to obtain vector embeddings.

Proof of concept feasibility models applied dimensionality reduction methods on the unlabeled vector embeddings, with labels applied afterwards to reveal separable malicious clusters. The embeddings were projected into UMAP space, historical labels overlaid post-hoc, and cluster separation quantified via silhouette scores demonstrated a potential 20-30% malicious traffic detection rate improvement.  

​With the feasibility of unsupervised classification proven, data pipelines for six months of training data were prepared for each of the seven endpoints. At the same time, a variational autoencoder deep learning model was built, and training and hyperparameter tuning pipelines were set up for each of the seven endpoints. Trained models were tracked in MLFlow, and deployed and served with Databricks' Model Serving service.

![[assets/CVS-case-study/model-details.jpg]]

## Success and Challenges

UMAP visualizations showed distinct latent space regions dominated by malicious traffic (>90% purity in top clusters via post-hoc labels), confirming embeddings captured separable signals for variational autoencoder anomaly detection. Production models, each trained for a specific endpoint on six months of data and served with Databricks, integrated successfully into Splunk with phased rollout, providing real-time bot scores for security triage.

Unfortunately, some advanced bots fell into ambiguous latent regions, evading high reconstruction error thresholds. Seasonal traffic surges (e.g., promotions) may have produced false anomalies; this will require a deeper look into threshold tuning.

## What Worked Well

- Unsupervised UMAP PoCs provided rapid visual proof, expediting stakeholder buy-in.​
- Model metrics displayed on realtime dashboards also gained stakeholder buy-in while supporting the case for regular model retraining.
- Feature engineering blending header information signals outperformed manual rulesets.

## Issues Faced

- Large size of training data required careful design of feature engineering processes and tradeoffs between simplicity, speed, reliability, and cost.
- Endpoint prioritization tradeoffs caused scope creep frustration.
- Traffic surges were sometimes interpreted as bots.
- Tensions arose between blocking aggressiveness and allowing potential legitimate human users.

## Takeaways

- Using unsupervised learning can provide a model with flexibility beyond the story labeled data tells. This approach excels for zero-day threats and drift in adversarial domains.    
- Visual demonstrations (UMAP visualizations) build security team trust faster than purely numerical metrics.​
- Ongoing model monitoring and retraining are essential as attackers are constantly evolving.
- Building in a human feedback loop alongside a continuous learning ML feedback loop is a very powerful system design to constantly improve an ML model.
- SentencePiece tokenizers can be trained to tokenize arbitrary byte-like or text-like data, making them suitable for mixed header fields.
