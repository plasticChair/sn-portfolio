---
title: "Heated Gloves"
image: "/images/projects/heated-gloves/final.jpg"
imageAlt: "Heated Gloves final-project photo placeholder"
summary: "A custom glove-heating controller with switched heater outputs, temperature feedback, and battery and current sensing."
category: "Wearables"
status: "Design documented"
tags: ["ATtiny1627", "Temperature sensing", "MOSFETs"]
order: 18
tools: ["KiCad", "AVR C", "Atmel Studio"]
---

## The project

The idea for this project came from my ice climbing experience and getting cold hands from that. I learned that heated gloves were essential, but was disappointed with the options available. A couple of issues with the ones I bought were the low output power and the drop in heating capabilities as the battery voltage dropped. I aimed to fix those.

## Hardware and control

The design does a few things differently than commercially available heated gloves.

1. My gloves are divided into 5 heating zones, and each zone has its own temperature sensor.
2. There is current feedback on each zone to ensure the expected output.
3. The glove is capable of constant output power independent of battery voltage (until the battery is dead).

The design uses an **ATtiny1627** to control the heaters and read the temperature sensors. The controller is capable of an output power of about 60 W.

<figure class="prototype-photo">
	<img src="/images/projects/heated-gloves/prototype.jpg" alt="Heated Gloves prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Heat versus available power:** heater operation has to fit the battery budget without allowing load changes to undermine voltage and current measurements.
- **Temperature feedback:** sensor placement, response time, and the relationship between sensed temperature and skin-contact surfaces matter more than the sensor reading alone.
- **Mixed-signal layout:** high-current heater returns need careful separation from low-level temperature and current-sense signals.
- **Fault behavior:** sensor disconnection, stalled control logic, and excessive temperature are important cases for validation before wearable use.
