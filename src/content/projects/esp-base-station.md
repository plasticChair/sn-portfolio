---
title: "ESP Base Station"
image: "/images/projects/esp-base-station/final.jpg"
imageAlt: "ESP-NOW Gateway Base Station Project"
summary: "An ESP32 breakout board that is used to bridge ESP-NOW devices to my home network."
category: "Wireless"
status: "Design documented"
tags: ["ESP32", "Base station"]
order: 10
tools: ["KiCad", "PCB fabrication configuration"]
---

## The project

ESP-NOW is a low-power communication protocol that allows ESP devices to talk to each other. Normally Wi-Fi would be used in place of this. The problem with Wi-Fi for some applications is the power consumption and the time it takes to connect to the network. This gateway allows ESP-NOW devices to connect to it directly in order to minimize power. This device can then connect to my home Wi-Fi to deliver the payload (typically to Home Assistant).

## The Design

The design uses an ESP32 module with an **FT231XS** USB-to-UART bridge, along with a **BQ21040** battery charger and an **LM3671** regulator. The charger was added to maintain the battery that was used in the design in case of a brief power loss, which was happening quite often during the design of this project. This ESP sits waiting for messages from any device. When it receives one, it passes the ESP-NOW message to Home Assistant, where it can be used for logging temperature, turning lights on or off, or any other automation.

<figure class="prototype-photo">
	<img src="/images/projects/esp-base-station/prototype.png" alt="ESP Base Station prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Software:** While documentation states that Wi-Fi and ESP-NOW can be used simultaneously, getting them to work properly proved to be difficult. After some time and reading a bunch of forum posts, I finally got it working.

