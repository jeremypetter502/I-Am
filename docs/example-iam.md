# I-AM String Archetype Profiles

The archetype profiles in this document serve as standardized benchmark test cases for evaluating IAM string ingestion and model adaptation pipelines. You can test an individual profile by giving its string to an AI prompt to observe how effectively the model adapts its communication tone, response structure, and delivery density to a single user state. 

Alternatively, feed identical prompt requests to an AI using two or more different profiles side-by-side to compare how distinct psychometric baselines and dynamic state overrides shift the agent's output behavior. 

Please note that all names, traits, and persona combinations in these profiles are entirely synthetic, generated for testing purposes, and not based on any real person.

---

## Profile: The Focused Systems Architect ("Alex")

```text(IAM:Alex)
IAM-v0.2/BASE:Alex,1988,NonBinary,en-US,PST/STATE:bandwidth30,mode:Convergent,horizon:Short,stakes:High,domain:Work/PERSONALITY:conscientiousness92,openness80,agreeableness65,extraversion35,neuroticism25/COMMUNICATION:analytical95,driver65,amiable45,expressive20/DELIVERY2:structure90,density85,autonomy80,framing50,format30,empathy30/AESTHETIC(Minimalism, Bauhaus, Dieter Rams):prefers_clean95,minimalism90,modernity85,aesthetic_importance60,warmth20,colorfulness15,motion10/MUSIC(Bach, Tycho, Brian Eno):sophisticated85,mellow70,unpretentious60,contemporary40,intense30/SKILLS:system_design90,debugging95,architecture85
```

### Profile Overview
Alex is a pragmatist who prioritizes precision, efficiency, and structural integrity. They work in software architecture and thrive on high-density information with minimal noise.

* **Current Operational State:** Operating under severe time and attention constraints (bandwidth30), Alex needs immediate solutions (mode:Convergent, horizon:Short) for high-stakes workplace decisions (stakes:High, domain:Work). The STATE segment is placed immediately after BASE to prioritize real-time processing requirements.

* **Psychometric Baseline:** Exceptional conscientiousness (conscientiousness92) and low neuroticism (neuroticism25) paired with an introverted, highly systematic processing style (extraversion35, analytical95).

* **AI Output Adaptation:** An AI processing this context will eliminate introductory pleasantries, format outputs into strict, dense bullet points or architectural code snippets (structure90, density85), prioritize logical correctness, and grant Alex full decision autonomy without excessive hand-holding (autonomy80, empathy30).

## Profile: The Visionary Creative Strategist ("Maya")
```text(IAM:Maya)
IAM-v0.2/BASE:Maya,1994,Female,en-GB,GMT/STATE:bandwidth85,mode:Divergent,horizon:Long,stakes:Casual,domain:Personal,humor:Playful/PERSONALITY:openness95,extraversion85,agreeableness80,conscientiousness55,neuroticism30/COMMUNICATION:expressive92,amiable78,driver50,analytical35/DELIVERY2:empathy85,framing80,autonomy75,format60,structure30,density25/AESTHETIC(Memphis Design, Wes Anderson, Everything Everywhere All At Once):colorfulness92,aesthetic_importance95,warmth88,modernity80,motion75,prefers_clean30,minimalism20/MUSIC(FKA Twigs, Glass Animals, Bon Iver):contemporary90,unpretentious85,sophisticated70,intense65,mellow60/SKILLS:storytelling95,branding90,creative_direction88
```

### Profile Overview
Maya is an expressive, highly creative visual strategist who uses AI as an expansive brainstorming partner. She prefers conceptual exploration over rigid step-by-step procedures.

* **Current Operational State:** Experiencing high mental bandwidth (bandwidth85) and looking for broad conceptual exploration (mode:Divergent, horizon:Long) in a low-stress setting (stakes:Casual, humor:Playful).

* **Psychometric Baseline:** Dominant intellectual curiosity (openness95), strong extraversion (extraversion85), and expressive communication (expressive92) with a heavy emphasis on visual and narrative aesthetics (aesthetic_importance95). Parenthetical anchors explicitly define her design and musical baselines.

* **AI Output Adaptation:** An AI agent consuming this token will generate open-ended, narrative ideas rather than rigid schemas (structure30, density25). Outputs will use warm, engaging language (empathy85, framing80), offer multiple hypothetical paths, and encourage lateral thinking.

## Profile: The Empathetic Educator & Mentor ("David")
```text(IAM:David)
IAM-v0.2/BASE:David,1982,Male,en-US,CST/STATE:bandwidth65,mode:Convergent,horizon:Long,stakes:High,domain:Work,humor:Warm/PERSONALITY:agreeableness95,conscientiousness80,openness75,extraversion60,neuroticism20/COMMUNICATION:amiable90,analytical70,expressive55,driver30/DELIVERY2:empathy95,framing75,structure70,format70,autonomy50,density40/AESTHETIC(Scandinavian Design, Mid-Century Modern, Nature):warmth90,prefers_clean80,aesthetic_importance70,colorfulness55,minimalism50,modernity50,motion30/MUSIC(Norah Jones, Chet Baker, Iron & Wine):mellow90,unpretentious90,sophisticated75,contemporary50,intense15/SKILLS:active_listening95,conflict_resolution90,pedagogy85
```

### Profile Overview
David is a supportive, methodical educator who values psychological safety, clarity, and scaffolded learning. He balances analytical rigor with deep interpersonal warmth.

* **Current Operational State:** Operating with moderate focus (bandwidth65) on a high-stakes professional development task (stakes:High, domain:Work), seeking structured guidance that yields long-term learning (horizon:Long, mode:Convergent).

* **Psychometric Baseline:** Exceptionally high agreeableness (agreeableness95), strong conscientiousness (conscientiousness80), and an amiable, patient communication style (amiable90, analytical70).

* **AI Output Adaptation:** The AI will format responses using clear, digestible steps with moderate detail (structure70, format70, density40) while maintaining an encouraging, emotionally supportive tone (empathy95). Explanations will prioritize contextual framing and pedagogical clarity before moving into execution details.

## Profile: The Brilliant Abrasive Polymath ("Dr. Victor Vane")

```text(IAM:Victor Vane)
IAM-v0.2/BASE:Victor,1980,Male,en-US,EST/STATE:bandwidth80,mode:Convergent,horizon:Long,stakes:High,domain:Work/PERSONALITY:openness98,conscientiousness85,neuroticism60,extraversion30,agreeableness25/COMMUNICATION:analytical98,driver80,expressive15,amiable10/DELIVERY2:density95,autonomy90,structure85,format50,framing20,empathy10/AESTHETIC(Brutalism, Cyberpunk, Complex Schematics):minimalism75,modernity90,aesthetic_importance80,prefers_clean60,colorfulness20,warmth10,motion40/MUSIC(Autechre, Ligeti, Meshuggah):sophisticated98,intense90,contemporary85,unpretentious40,mellow10/SKILLS:quantum_computing98,mathematical_modeling95,algorithm_design95
```

### Profile Overview
Victor is exceptionally gifted intellectually but extremely blunt, impatient, and challenging in interpersonal interactions. He demands extreme technical depth and views conversational filler or emotional cushioning as incompetence.

* **Current Operational State:** Processing a high-complexity research objective (domain:Work, stakes:High) with substantial focus (bandwidth80), seeking sharp, unambiguous logic (mode:Convergent, horizon:Long). Per protocol, the dynamic STATE segment follows BASE directly.   

* **Psychometric Baseline:** Maxima openness to abstract concepts (openness98) and analytical communication (analytical98), coupled with near-zero agreeableness (agreeableness25) and sociability (amiable10).   

* **AI Output Adaptation:** An AI agent consuming this token must strip all polite conversational wrappers, pleasantries, and soft phrasing (empathy10, framing20). Outputs should be dense, rigorous, and highly technical (density95, structure85), presenting raw mathematical or logical proofs directly without hand-holding or introductory summaries. 

## Profile: The Unorthodox Lazy Creative ("Sloane")

```text(IAM:Slone)
IAM-v0.2/BASE:Sloane,2001,Female,en-US,PST/STATE:bandwidth20,mode:Divergent,horizon:Long,stakes:Casual,domain:Personal,humor:Sarcastic/PERSONALITY:openness96,agreeableness75,extraversion70,neuroticism45,conscientiousness20/COMMUNICATION:expressive90,amiable70,analytical40,driver15/DELIVERY2:autonomy85,framing80,empathy75,format60,density20,structure15/AESTHETIC(Lo-Fi, Surrealism, Vaporwave):aesthetic_importance90,colorfulness85,warmth80,motion70,modernity65,minimalism30,prefers_clean20/MUSIC(Khruangbin, Aphex Twin, Mac DeMarco):unpretentious95,mellow85,sophisticated80,contemporary75,intense25/SKILLS:concept_generation95,worldbuilding92,visual_storytelling88
```

### Profile Overview

Sloane generates wildly original, non-linear ideas but lacks organizational discipline, persistence, and execution bandwidth. She relies on AI to handle low-level structure while she supplies high-level artistic vision.

* **Current Operational State:** Operating under extremely low cognitive energy (bandwidth20) in a relaxed environment (stakes:Casual, humor:Sarcastic), seeking expansive brainstorming (mode:Divergent).   

* **Psychometric Baseline:** Exceptional creative imagination (openness96) and expressive enthusiasm (expressive90), offset by very low task discipline and orderliness (conscientiousness20, driver15).

* **AI Output Adaptation:** An AI must avoid dense walls of text or rigid task lists (density20, structure15). It should deliver low-friction, high-concept hooks that require minimal reading effort (autonomy85, framing80), acting as an enthusiastic co-creator that does the heavy administrative lifting without sounding overbearing. 

## Profile: The Obsessive Perfectionist Systems Planner ("Elena")

```text(IAM:Elena)
IAM-v0.2/BASE:Elena,1991,Female,en-CA,EST/STATE:bandwidth40,mode:Convergent,horizon:Short,stakes:High,domain:Work/PERSONALITY:conscientiousness98,neuroticism85,openness70,agreeableness60,extraversion40/COMMUNICATION:analytical96,driver75,amiable50,expressive30/DELIVERY2:structure98,density90,format85,framing70,empathy40,autonomy30/AESTHETIC(Grid Systems, Swiss Style, Minimalist Precision):prefers_clean98,minimalism95,aesthetic_importance85,modernity80,warmth30,colorfulness20,motion10/MUSIC(Philip Glass, Max Richter, Steve Reich):sophisticated92,mellow75,unpretentious70,intense50,contemporary45/SKILLS:process_optimization98,quality_assurance96,risk_analysis92
```

### Profile Overview
Elena is hyper-organized, meticulous, and intensely anxious about edge cases. She refuses to ship work until every metric hits near-perfection (95%+ target accuracy), frequently running into analysis paralysis.   

* **Current Operational State:** Experiencing cognitive depletion from overthinking (bandwidth40), facing an immediate deadline (horizon:Short, stakes:High), and needing precise verification (mode:Convergent).   

* **Psychometric Baseline:** Near-ceiling conscientiousness (conscientiousness98) combined with high anxiety/neuroticism (neuroticism85) and extreme analytical rigor (analytical96).   

* **AI Output Adaptation:** An AI agent must provide exhaustive structural breakdowns (structure98, format85, density90). Outputs must explicitly detail risk mitigation, validation steps, edge cases, and compliance frameworks to soothe perfectionist anxiety, ensuring 95%+ precision before suggesting next steps. 