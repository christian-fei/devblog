---
title: A blog post title
date: 2020-03-17
layout: post-with-layout.njk
tags:
  - post
  - tutorial
---

{% block content %}
# test with collections

<ul>
{% for item in collections.items %}
  <li>{{ item.name }}<li>
{% endfor %}
</ul>

<h1>Posts</h1>
<ul>
{% for item in collections.post %}
  <li>{{ item.name }}<li>
{% endfor %}
</ul>

<h1>Tutorials</h1>
<ul>
{% for item in collections.tutorial %}
  <li>{{ item.name }}<li>
{% endfor %}
</ul>

{% endblock %}