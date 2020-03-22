---
title: A blog post title
date: 2020-03-17
layout: post-with-layout.njk
---

{% block content %}
# test with collections

<ul>
{% for item in collections.items %}
  <li>{{ item.name }}<li>
{% endfor %}
</ul>
{% endblock %}