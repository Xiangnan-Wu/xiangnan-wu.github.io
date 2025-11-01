---
permalink: /
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---
<style>
    .experience-card {
        display: flex;
        align-items: center;
        background: #f9f9f9;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 0px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        transition: transform 0.3s, box-shadow 0.3s;
    }
    .experience-card:hover {
       
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .experience-logo {
        width: 60px;
        height: 60px;
        margin-right: 20px;
        border-radius: 8px;
        object-fit: contain;
    }
    .experience-info {
        font-family: "Segoe UI", sans-serif;
    }
    .experience-info strong {
        font-size: 1.1em;
    }
    .experience-info a {
        text-decoration: none;
        color: #3584c0;
    }
    .experience-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }
    .experience-card {
        box-sizing: border-box;
    }
    .publication-card {
        display: flex;
        align-items: center;
        padding: 3px;
        border: 1.5px solid #ddd;
        border-radius: 8px;
        background: #fff;
        box-sizing: border-box;
        margin-bottom: 20px; 
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .publication-card:hover {
       
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .publication-card.featured {
        border-color: #b3d9ff;       /* 浅蓝色边框 */
        background: #f0f7ff;         /* 非常浅的蓝色背景 */
        box-shadow: 0 4px 8px rgba(53, 132, 192, 0.2); /* 柔和的蓝色阴影 */
        z-index: 10;
    }

    .publication-card.featured:hover {
        box-shadow: 0 8px 16px rgba(53, 132, 192, 0.4); 
    }
    
</style>
<html> 
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fredericka+the+Great&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap');
        body {
            background-color:	 #FFFFFF;
            font-family: 'Arial Rounded MT Bold', 'Verdana', sans-serif;
            font-size: 15px;
        }
        .main-heading {
            font-family: 'Permanent Marker', cursive;
            text-align: center;
            color: #3584c0;
        }
        div.markdown-body a,a {
            text-decoration: none !important;
            color: #3584c0;
            transition: all 0.3s ease; /* 平滑过渡效果 */
        }
        div.markdown-body a:hover, a:hover {
            color: #1976D2;            /* 悬浮时变深一点的颜色 */
            text-decoration: underline; /* 加上悬浮时的下划线 */
        }
    </style>
</head>
<body>
<h1 class="main-heading">Hi there <img src="images/Hi.gif" width="40px"> Welcome to my Homepage!</h1>
</body>
</html>

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
      <img src="images/microsoft.png" alt="MS logo" class="experience-logo">
      <div class="experience-info">
          <strong>Microsoft Research</strong><br>
          Nov. 2025 - Now<br>
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
          Rank 1/115, <b>National Scholarship $\times$ 2</b><br>
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
    <img src="images/Bridgevla.png" alt="RIaa" width="200" height="100" style="margin-right: 20px;">
    <div>
        <strong>BridgeVLA: Input-Output Alignment for Efficient 3D Manipulation Learning with Vision-Language Models</strong><br>
       <i style="font-size: 13px;">
    Peiyan Li, Yixiang Chen, Hongtao Wu, Xiao Ma, <strong>Xiangnan Wu</strong>,
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
    Yuan Xu, Jiabing Yang, Xiaofeng Wang, Yixiang Chen, Zheng Zhu, Bowen Fang, Guan Huang, Xinze Chen, Yun Ye, Qiang Zhang, Peiyan Li, <strong>Xiangnan Wu<\strong>, Kai Wang, Bing Zhan, Shuo Lu, Jing Liu, Nianfeng Liu, Yan Huang, Liang Wang
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

