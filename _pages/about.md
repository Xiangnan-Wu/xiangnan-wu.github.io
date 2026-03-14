---
permalink: /
author_profile: true
redirect_from:
  - /about/
  - /about.html
---
<style>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

/* ── Section intro heading ── */
.main-heading {
    font-family: 'Permanent Marker', cursive;
    text-align: center;
    font-size: 1.6em;
    margin-bottom: 0.6em;
    background: linear-gradient(90deg, #448bff, #44e9ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 8px rgba(68,139,255,0.3));
}

/* ── News item ── */
.news-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(68, 139, 255, 0.07);
    border: 1px solid rgba(68, 139, 255, 0.22);
    border-radius: 10px;
    margin-bottom: 10px;
    font-size: 0.93em;
    color: #e2e8f0;
    transition: background 0.2s ease;
}
.news-item:hover {
    background: rgba(68, 139, 255, 0.12);
}
.news-item a {
    color: #44e9ff !important;
    font-weight: 600;
}

/* ── Experience Cards ── */
.experience-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 16px;
    margin-top: 8px;
}
.experience-card {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(148, 163, 184, 0.14);
    border-radius: 16px;
    padding: 16px 18px;
    box-sizing: border-box;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}
.experience-card:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(68, 139, 255, 0.38);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.48), 0 0 14px rgba(68, 139, 255, 0.15);
}
.experience-logo {
    width: 52px;
    height: 52px;
    min-width: 52px;
    margin-right: 16px;
    border-radius: 10px;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.1);
    padding: 5px;
    border: 1px solid rgba(255,255,255,0.1);
}
.experience-info {
    font-family: "Segoe UI", system-ui, sans-serif;
}
.experience-info .exp-title {
    font-size: 0.95em;
    font-weight: 700;
    color: #e2e8f0;
    display: block;
    margin-bottom: 2px;
}
.experience-info .exp-period {
    font-size: 0.78em;
    color: #94a3b8;
    display: block;
    margin-bottom: 3px;
}
.experience-info .exp-desc {
    font-size: 0.82em;
    color: #94a3b8;
}
.experience-info .exp-desc a {
    color: #448bff !important;
    text-decoration: none;
}
.experience-info .exp-desc a:hover {
    color: #44e9ff !important;
}

/* ── Publication Cards ── */
.publication-card {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 18px 20px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-sizing: border-box;
    margin-bottom: 16px;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.3);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}
.publication-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(68, 139, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42), 0 0 12px rgba(68, 139, 255, 0.12);
}
.pub-thumb {
    flex-shrink: 0;
    width: 190px;
    height: 108px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
}
.pub-body {
    flex: 1;
    min-width: 0;
}
.pub-title {
    font-size: 0.96em;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 5px;
    line-height: 1.4;
    display: block;
}
.pub-authors {
    font-size: 0.78em;
    color: #94a3b8;
    margin-bottom: 6px;
    line-height: 1.5;
}
.pub-authors strong {
    color: #e2e8f0 !important;
    font-weight: 700;
}
.pub-desc {
    font-size: 0.8em;
    color: #64748b;
    margin-bottom: 8px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.pub-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
/* Venue badge */
.venue-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.73em;
    font-weight: 700;
    letter-spacing: 0.02em;
}
.venue-conference {
    background: linear-gradient(90deg, #448bff, #44e9ff);
    color: #0B0B10;
}
.venue-preprint {
    background: rgba(148, 163, 184, 0.18);
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #94a3b8;
}
/* Paper links */
.pub-link {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 0.73em;
    background: rgba(68, 139, 255, 0.1);
    border: 1px solid rgba(68, 139, 255, 0.25);
    color: #448bff !important;
    text-decoration: none !important;
    transition: all 0.2s ease;
}
.pub-link:hover {
    background: rgba(68, 139, 255, 0.2) !important;
    border-color: rgba(68, 139, 255, 0.5) !important;
    color: #44e9ff !important;
}

/* ── Awards list ── */
.award-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    font-size: 0.9em;
    color: #e2e8f0;
}
.award-item:last-child { border-bottom: none; }
.award-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: linear-gradient(135deg, #448bff, #44e9ff);
    flex-shrink: 0;
}

/* ── Responsive: stack pub image on small screens ── */
@media screen and (max-width: 680px) {
    .publication-card { flex-direction: column; }
    .pub-thumb { width: 100%; height: 140px; }
    .experience-container { grid-template-columns: 1fr; }
}
</style>

<h1 class="main-heading">Hi there <img src="images/Hi.gif" width="36px"> Welcome to my Homepage!</h1>

I am an undergraduate (2022–2026) at University of Science and Technology Beijing, *focusing on Multimodal Learning and Robot Manipulation.*

I'm also an incoming PhD student at Institute of Automation, Chinese Academy of Sciences under supervision of [Prof. Yan Huang](https://people.ucas.ac.cn/~huangyan2021) and [Prof. Liang Wang](https://ia.cas.cn/rcdw/yjy/202404/t20240422_7129880.html).

Currently I conduct Multimodal Agent research at [Microsoft Research](https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/).

News
--------------

<div class="news-item">🔥 <span><a href="https://bridgevla.github.io/home_page.html">BridgeVLA</a> is accepted to <strong>NeurIPS 2025</strong></span></div>

Experience
--------------
<div class="experience-container">

  <div class="experience-card">
    <img src="images/agibot3.jpg" alt="Agibot" class="experience-logo">
    <div class="experience-info">
      <span class="exp-title">Agibot Research</span>
      <span class="exp-period">Feb. 2026 – Present</span>
      <span class="exp-desc">Research Intern · <a href="https://www.agibot.com/">Agibot</a></span>
    </div>
  </div>

  <div class="experience-card">
    <img src="images/microsoft.png" alt="Microsoft Research" class="experience-logo">
    <div class="experience-info">
      <span class="exp-title">Microsoft Research Asia</span>
      <span class="exp-period">Nov. 2025 – Feb. 2026</span>
      <span class="exp-desc">Research Intern · <a href="https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/">Visual Computing Group</a></span>
    </div>
  </div>

  <div class="experience-card">
    <img src="images/casia.png" alt="CASIA" class="experience-logo">
    <div class="experience-info">
      <span class="exp-title">CASIA · NLPR</span>
      <span class="exp-period">Apr. 2025 – Present</span>
      <span class="exp-desc">Research Intern · <a href="https://nlpr-web.ia.ac.cn/en/">NLPR@CASIA</a></span>
    </div>
  </div>

  <div class="experience-card">
    <img src="images/USTB.png" alt="USTB" class="experience-logo">
    <div class="experience-info">
      <span class="exp-title">Univ. of Sci. & Tech. Beijing</span>
      <span class="exp-period">Sep. 2022 – Jul. 2026</span>
      <span class="exp-desc">Rank 1/115 · National Scholarship ×2 · <a href="https://gcsxy.ustb.edu.cn/">B.E. AE</a></span>
    </div>
  </div>

</div>

Publications
--------------

<div class="publication-card">
  <img class="pub-thumb" src="images/bridgev2w.jpg" alt="BridgeV2W">
  <div class="pub-body">
    <span class="pub-title">BridgeV2W: Bridging Video Generation Models to Embodied World Models via Embodiment Masks</span>
    <div class="pub-authors">
      Yixiang Chen, Peiyan Li, Jiabing Yang, Keji He, <strong>Xiangnan Wu</strong>, Yuan Xu, Kai Wang, Jing Liu, Nianfeng Liu, Yan Huang, Liang Wang
    </div>
    <div class="pub-desc">BridgeV2W bridges pretrained video generation models to embodied world models via embodiment masks that align actions with pixel spaces, ensuring viewpoint robustness and embodiment-agnostic architectures.</div>
    <div class="pub-footer">
      <span class="venue-badge venue-preprint">Preprint</span>
      <a class="pub-link" href="https://arxiv.org/abs/2602.03793">arXiv</a>
      <a class="pub-link" href="https://bridgev2w.github.io/">Project</a>
    </div>
  </div>
</div>

<div class="publication-card">
  <img class="pub-thumb" src="images/Bridgevla.png" alt="BridgeVLA">
  <div class="pub-body">
    <span class="pub-title">BridgeVLA: Input-Output Alignment for Efficient 3D Manipulation Learning with Vision-Language Models</span>
    <div class="pub-authors">
      Peiyan Li, Yixiang Chen, Hongtao Wu, Xiao Ma, <strong>Xiangnan Wu</strong>, Yan Huang, Liang Wang, Tao Kong, Tieniu Tan
    </div>
    <div class="pub-desc">BridgeVLA enables efficient 3D robot manipulation by aligning 3D inputs and action outputs within a consistent 2D image space, leveraging pre-trained vision-language models.</div>
    <div class="pub-footer">
      <span class="venue-badge venue-conference">NeurIPS 2025</span>
      <a class="pub-link" href="https://arxiv.org/pdf/2506.07961">arXiv</a>
      <a class="pub-link" href="https://bridgevla.github.io/home_page.html">Project</a>
    </div>
  </div>
</div>

<div class="publication-card">
  <img class="pub-thumb" src="images/iraa.png" alt="EgoDemoGen">
  <div class="pub-body">
    <span class="pub-title">EgoDemoGen: Novel Egocentric Demonstration Generation Enables Viewpoint-Robust Manipulation</span>
    <div class="pub-authors">
      Yuan Xu, Jiabing Yang, Xiaofeng Wang, Yixiang Chen, Zheng Zhu, Bowen Fang, Guan Huang, Xinze Chen, Yun Ye, Qiang Zhang, Peiyan Li, <strong>Xiangnan Wu</strong>, Kai Wang, Bing Zhan, Shuo Lu, Jing Liu, Nianfeng Liu, Yan Huang, Liang Wang
    </div>
    <div class="pub-desc">EgoDemoGen generates novel egocentric demonstrations by retargeting actions and synthesizing corresponding videos using the EgoViewTransfer model.</div>
    <div class="pub-footer">
      <span class="venue-badge venue-preprint">Preprint</span>
      <a class="pub-link" href="https://egodemogen.github.io/#">Project</a>
    </div>
  </div>
</div>

Awards
--------
<div class="award-item"><div class="award-dot"></div>National Scholarship 2025</div>
<div class="award-item"><div class="award-dot"></div>Beijing "San Hao" Student 2024</div>
<div class="award-item"><div class="award-dot"></div>National Scholarship 2024</div>
