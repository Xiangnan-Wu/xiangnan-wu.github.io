---
permalink: /
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---
<style>
    /* ── Experience Cards ── */
    .experience-card {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 16px;
        padding: 16px 20px;
        margin-bottom: 0;
        box-sizing: border-box;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    }
    .experience-card:hover {
        background: rgba(255, 255, 255, 0.13);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 0 18px rgba(167, 139, 250, 0.2);
        transform: translateY(-3px);
    }
    .experience-logo {
        width: 60px;
        height: 60px;
        min-width: 60px;
        margin-right: 18px;
        border-radius: 10px;
        object-fit: contain;
        background: rgba(255, 255, 255, 0.12);
        padding: 5px;
    }
    .experience-info {
        font-family: "Segoe UI", sans-serif;
        color: rgba(232, 234, 246, 0.88);
    }
    .experience-info strong {
        font-size: 1.05em;
        color: #e8eaf6;
    }
    .experience-info a {
        text-decoration: none;
        color: #7ec8e3;
    }
    .experience-info a:hover {
        color: #b39dfa;
    }
    .experience-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 18px;
    }

    /* ── Publication Cards ── */
    .publication-card {
        display: flex;
        align-items: center;
        padding: 16px 18px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        box-sizing: border-box;
        margin-bottom: 18px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
        transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    }
    .publication-card:hover {
        background: rgba(255, 255, 255, 0.11);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4), 0 0 16px rgba(126, 200, 227, 0.18);
        transform: translateY(-2px);
    }
    .publication-card img {
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
        margin-right: 18px;
        border: 1px solid rgba(255,255,255,0.12);
    }
    .publication-card.featured {
        border-color: rgba(126, 200, 227, 0.38);
        background: rgba(126, 200, 227, 0.08);
        box-shadow: 0 4px 18px rgba(126, 200, 227, 0.18);
    }
    .publication-card.featured:hover {
        box-shadow: 0 10px 28px rgba(126, 200, 227, 0.28), 0 0 16px rgba(126, 200, 227, 0.2);
    }
</style>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
    .main-heading {
        font-family: 'Permanent Marker', cursive;
        text-align: center;
        color: #7ec8e3;
        text-shadow: 0 0 20px rgba(126, 200, 227, 0.45), 0 2px 8px rgba(0,0,0,0.4);
        margin-bottom: 0.4em;
    }
</style>
<h1 class="main-heading">Hi there <img src="images/Hi.gif" width="40px"> Welcome to my Homepage!</h1>

I am an undergraduate (2022-2026) at Univeristy of Science and Technology Beijing, <em> focusing on Multimodal Learning and Robot Manipulation.</em>

I'm also an incoming PhD student at Institute Automation, Chinese Academy of Sciences under supervision [Prof. Yan Huang](https://people.ucas.ac.cn/~huangyan2021) and [Prof. Liang Wang](https://ia.cas.cn/rcdw/yjy/202404/t20240422_7129880.html)

Currently I conduct the Multimodal Agent research at [Microsoft Research](https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/).

News
---------------
- *[BridgeVLA](https://bridgevla.github.io/home_page.html) is accepted in NIPS 2025 &#128293;*

Experience
--------------
<div class="experience-container">
    <div class="experience-card">
      <img src="images/agibot3.jpg" alt="Agibot logo" class="experience-logo">
      <div class="experience-info">
          <strong>Agibot Research</strong><br>
          Feb. 2026 - Now<br>
          Research Intern at <a href="https://www.agibot.com/"><em>Agibot Research</em></a> 
      </div>
  </div>

  <div class="experience-card">
      <img src="images/microsoft.png" alt="MS logo" class="experience-logo">
      <div class="experience-info">
          <strong>Microsoft Research</strong><br>
          Nov. 2025 - Feb. 2026
          Research Intern at <a href="https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/"><em>Visual Computing Group</em></a> 
      </div>
  </div>

  <div class="experience-card">
      <img src="images/casia.png" alt="CASIA logo" class="experience-logo">
      <div class="experience-info">
          <strong>Institute Automation, Chinese Academy of Scienses</strong><br>
          April 2025 - Now<br>
          Research Intern at <a href="https://nlpr-web.ia.ac.cn/en/"><em>NLPR@CASIA</em></a> 
      </div>
  </div>


  <div class="experience-card">
      <img src="images/USTB.png" alt="USTB logo" class="experience-logo">
      <div class="experience-info">
          <strong>University of Science and Technology Beijing</strong><br>
          Sep 2022 - July 2026<br>
          Rank 1/115, <b>National Scholarship x 2</b><br>
          B.E at <a href="https://gcsxy.ustb.edu.cn/"><em>AE</em></a>
      </div>
  </div>
</div>

Publications
--------------
<!-- <div class="publication-card featured">
  <div style="display: flex; align-items: center;">
    <video width="200" height="120" style="margin-right: 20px; border-radius: 8px;" autoplay loop muted playsinline>
      <source src="https://github.com/Selen-Suyue/DSPv2Net/raw/main/video/videoshow.mp4" type="video/mp4">
    </video>
    <div>
        <strong>DSPv2: Improved Dense Policy for Effective and Generalizable Whole-body Mobile Manipulation</strong><br>
        <i style="font-size: 13px;">
            <a href="https://selen-suyue.github.io" target="_blank"><strong>Yue Su</strong></a>, 
            <a href="https://lin-shan.com/" target="_blank">Chubin Zhang</a>, 
            <a href="https://ch3cook-fdu.github.io/" target="_blank">Sijin Chen</a>,
            <a href="" target="_blank">Liufan Tan</a>, <br>
            <a href="https://andytang15.github.io/" target="_blank">Yansong Tang</a>,
            <a href="https://scholar.google.com/citations?user=mt5mvZ8AAAAJ&hl=en" target="_blank">Jianan Wang</a>,
            <a href="https://xh-liu.github.io/" target="_blank">Xihui Liu</a>&dagger;
        </i><br>
        Improved Dense Policy for Whole-body Mobile Manipulation, with effective perception, generalizable manipulation and coherent actions.
        <br>
        <b><i style="color:#83a1c7;">ArXiv Preprint &nbsp;</i></b>
        <a href="https://arxiv.org/abs/2509.16063"><em>[arXiv]</em></a>
        <a href="https://github.com/Selen-Suyue/DSPv2"><em>[code]</em></a>
        <a href="https://selen-suyue.github.io/DSPv2Net/"><em>[website]</em></a>
    </div>
  </div>
</div> -->


<div class="publication-card">
    <img src="images/bridgev2w.jpg" alt="RIaa" width="200" height="100" style="margin-right: 20px;">
    <div>
        <strong>BridgeV2W: Bridging Video Generation Models to Embodied World Models via Embodiment Masks</strong><br>
       <i style="font-size: 13px;">
    Yixiang Chen, Peiyan Li, Jiabing Yang, Keji He, Xiangnan Wu, Yuan Xu, Kai Wang, Jing Liu, Nianfeng Liu, Yan Huang, Liang Wang
    </i><br>
    BridgeV2W bridges pretrained video generation models to embodied world models via embodiment masks that align actions with pixel spaces, while ensuring viewpoint robustness, embodiment-agnostic architectures, and effective reuse of pretrained visual and motion priors. <br>
    <b><i style="color:#83a1c7;">Preprint &nbsp;</i></b>
      <a href="https://arxiv.org/abs/2602.03793"><em>[arxiv]</em></a>
      <a href="https://bridgev2w.github.io/"><em>[Project Website]</em></a>
    </div>
</div>

<div class="publication-card">
    <img src="images/Bridgevla.png" alt="RIaa" width="200" height="100" style="margin-right: 20px;">
    <div>
        <strong>BridgeVLA: Input-Output Alignment for Efficient 3D Manipulation Learning with Vision-Language Models</strong><br>
       <i style="font-size: 13px;">
    Peiyan Li, Yixiang Chen, Hongtao Wu, Xiao Ma, Xiangnan Wu,
    Yan Huang, Liang Wang, Tao Kong, Tieniu Tan
    </i><br>
    BridgeVLA enables efficient 3D robot manipulation by aligning 3D inputs and action outputs within a consistent 2D image space, leveraging pre-trained vision-language models. <br>
    <b><i style="color:#83a1c7;">NIPS 2025 &nbsp;</i></b>
      <a href="https://arxiv.org/pdf/2506.07961"><em>[arxiv]</em></a>
      <a href="https://bridgevla.github.io/home_page.html"><em>[Project Website]</em></a>
    </div>
</div>

<div class="publication-card">
    <img src="images/iraa.png" alt="Raa" width="200" height="100" style="margin-right: 20px;">
    <div>
        <strong>EgoDemoGen: Novel Egocentric Demonstration Generation Enables Viewpoint-Robust Manipulation</strong><br>
      <i style="font-size: 13px;">
    Yuan Xu, Jiabing Yang, Xiaofeng Wang, Yixiang Chen, Zheng Zhu, Bowen Fang, Guan Huang, Xinze Chen, Yun Ye, Qiang Zhang, Peiyan Li, Xiangnan Wu, Kai Wang, Bing Zhan, Shuo Lu, Jing Liu, Nianfeng Liu, Yan Huang, Liang Wang
    </i><br>
      The paper proposes EgoDemoGen, which generates novel egocentric demonstrations by retargeting actions and synthesizing corresponding videos using the EgoViewTransfer model.
      <br>
      <b><i style="color:#83a1c7;">Preprint &nbsp;</i></b>
      <a href="https://egodemogen.github.io/#"><em>[Project Website]</em></a>
    </div>
</div>


Awards
--------
- National Scholarship 2025
- Beijing "San Hao" Student 2024
- National Scholarship 2024

