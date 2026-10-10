---
title: "FindMe Compass"
image: "/images/projects/findme-compass/final.jpg"
imageAlt: "FindMe Compass project"
summary: "A compact navigation-hardware platform combining GNSS, orientation sensing, and connections for a display and guide lights."
category: "Wireless"
status: "Design documented"
tags: ["GNSS", "BNO086", "ESP32-S3"]
order: 11
role: "Circuit design, PCB layout & enclosure integration"
tools: ["KiCad", "Fusion CAD archive", "PCB assembly files"]
---

## The project

FindMe Compass brings position and orientation sensing into a compact board intended for directional guidance. The reviewed Plus Version combines a small ESP-based controller with dedicated navigation sensors and external display/indicator interfaces.

## Hardware architecture

The actual placed board contains a **XIAO ESP32-S3 Plus** module, a **SAM-M10Q-00B** GNSS module, and a **BNO086** orientation sensor. These parts are present in the PCB design, not inferred solely from the project name.

The schematic identifies GNSS UART receive/transmit signals and a time-pulse connection, together with sensor reset/wake signals and I2C lines. Display clock, data, chip-select, command/data, and backlight signals expose a separate visual interface. A `GuideLights` connection supports an additional directional indicator.

Power-switching MOSFETs, an **APX803L** supervisor, battery measurement, and accessory connections support system integration. Assembly files and mechanical exports accompany the electronics. Labels for an SX1262 interface also appear, but they do not establish a fitted radio module or a working radio link in this reviewed board.

<figure class="prototype-photo">
	<img src="/images/projects/findme-compass/prototype.png" alt="FindMe Compass prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Position is not heading:** location and orientation information need different treatment, especially when the user is stationary or moving slowly.
- **Calibration and interference:** magnetic surroundings, nearby current paths, and mounting orientation can affect a guidance experience.
- **Loss of a valid fix:** the interface needs a meaningful state when GNSS data is missing or stale rather than presenting an unreliable direction.
- **Portable power and packaging:** antennas, sensors, display visibility, and the enclosure all compete for limited space.

## Validation to document

The hardware supports a navigation platform, but the files reviewed do not establish a completed bearing algorithm or location accuracy. Screenshots, calibration procedure, outdoor trials, fix-status behavior, and runtime measurements would complete the case study.