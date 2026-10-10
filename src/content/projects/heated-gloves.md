---
title: "Heated Gloves"
image: "/images/projects/heated-gloves/final.png"
imageAlt: "Heated Gloves final-project photo placeholder"
summary: "A custom glove-heating controller with switched heater outputs, temperature feedback, and battery and current sensing."
category: "Wearables"
status: "Design documented"
tags: ["ATtiny1627", "Temperature sensing", "MOSFETs"]
order: 18
role: "Circuit design, PCB layout & embedded firmware"
tools: ["KiCad", "AVR C", "Atmel Studio"]
---

## The project

Heating a wearable is a power-control problem as much as a comfort problem. This design brings heater switching, temperature measurement, user input, and battery monitoring onto a dedicated controller for heated gloves.

## Hardware and control

The board uses an **ATtiny1627** and separates the design into power, heater, and sensor sheets. Five heater connections are labeled `Heater1` through `Heater5`, with three heater-enable signals. These are not five independently documented control channels.

Four temperature-sense outputs connect the sensor circuitry to the controller. The placed components include **LMT84** temperature sensors, an **INA186** current-sense amplifier, a low-value current-sense resistor, and MOSFET switching devices. Dedicated battery-sense, current-sense-enable, and temperature-sense-enable signals provide the hardware interfaces for monitoring and power control.

An RGB indicator, switch-detect input, and serial receive/transmit connections round out the interface. Separate V0 and V1 firmware projects document software iteration alongside the board design.

<figure class="prototype-photo">
	<img src="/images/projects/heated-gloves/prototype.png" alt="Heated Gloves prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Heat versus available power:** heater operation has to fit the battery budget without allowing load changes to undermine voltage and current measurements.
- **Useful temperature feedback:** sensor placement, response time, and the relationship between sensed temperature and skin-contact surfaces matter more than the sensor reading alone.
- **Mixed-signal layout:** high-current heater returns need careful separation from low-level temperature and current-sense signals.
- **Fault behavior:** sensor disconnection, stalled control logic, and excessive temperature are important cases for validation before wearable use.

## Validation to document

The design files establish the architecture, not a measured thermal profile or a certified protection system. Useful additions would be warm-up curves, temperature uniformity, current draw at each setting, battery runtime, and the response to disconnected or failed sensors.