---
title: "WiFi Button"
image: "/images/projects/wifi-button/final.jpg"
imageAlt: "WiFi Button project"
summary: "A battery-powered ESP32 button with charging and a simple button."
category: "Wireless"
status: "Design Completed"
tags: ["ESP32", "Battery power", "Button interface"]
order: 11
tools: ["KiCad", "Mechanical CAD exports", "PCB assembly files"]
---

## The project

This is one of my ESP-NOW devices that connects to the base station from my other listed project. It allows me to easily turn my smart lights on or off with minimal effort. The fun part about this project is that I was trying to make it as small as possible, and I think I succeeded.

## Hardware architecture

I used a single-core **ESP32-SOLO-1** for this design, as it's low-power compared to other ESP32 devices. The button enables power to the uC, and the uC transmits an ESP-NOW message. When the user presses the button off, everything shuts off.
Add a battery, USB-C port, and charging circuit, and it's ready to go!

One of the more satisfying things about this project was the battery connector. It's a tiny connector. But I remember taking apart another random device and it used the same connector! Very rewarding when you happen to choose the same connector as a popular item that has sold thousands of products.

<figure class="prototype-photo">
	<img src="/images/projects/wifi-button/prototype.jpg" alt="WiFi Button prototype or internal PCB" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Case Design:** Designing and printing a functional case was a little tricky. I ended up using 2 mm plastic threaded inserts!