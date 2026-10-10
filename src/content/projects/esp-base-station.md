---
title: "ESP Base Station"
image: "/images/projects/esp-base-station/final.jpg"
imageAlt: "ESP Base Station project"
summary: "An ESP32 carrier board with battery charging, regulated power, USB-to-UART connectivity, and accessible hardware interfaces."
category: "Wireless"
status: "Design documented"
tags: ["ESP32", "USB-to-UART", "Base station"]
order: 10
role: "Circuit design & PCB layout"
tools: ["KiCad", "PCB fabrication configuration"]
---

## The project

ESP Base Station is the portfolio name for the **ESP-BreakoutBoard** design inside the ESP-NowStation project. It provides a dedicated carrier for an ESP module rather than relying on an off-the-shelf development board and loose power wiring.

## Board architecture

The placed module is an **ESP32-SOLO-1**. The board pairs it with an **FT231XS** USB-to-UART bridge, a **BQ21040** battery charger, and an **LM3671** regulator. The schematics divide the design into microcontroller, power, and user-interface sheets.

GPIO headers, configuration jumpers, status LEDs, pushbuttons, and programming/debug connections provide access around the module. The USB bridge gives the design an explicit serial interface instead of assuming native USB support from the ESP32 module.

The ESP-NowStation parent project indicates the intended base-station context. The carrier itself does not establish a particular ESP-NOW message format, peer count, mesh topology, or application protocol; those are firmware-level details to document separately.

<figure class="prototype-photo">
	<img src="/images/projects/esp-base-station/prototype.png" alt="ESP Base Station prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Radio power demand:** the regulated supply and local decoupling need to accommodate the module's changing load without unstable resets.
- **RF versus layout:** module placement, antenna clearance, nearby copper, and enclosure materials can affect reception.
- **Programming access:** boot, reset, serial connections, and external peripherals must coexist without making the board difficult to recover or debug.
- **Power-source interaction:** USB operation and battery charging need to be assessed together, including the intended use while charging.

## Validation to document

An assembled-board photo, the deployed firmware, a connected-node example, serial logs, and measured radio/power behavior would turn the carrier design into a fuller base-station case study. Communication range and protocol performance are not claimed from hardware files alone.