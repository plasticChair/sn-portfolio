---
title: "LiPo 3S Cutoff"
image: "/images/projects/lipo-3s-cutoff/final.jpg"
imageAlt: "LiPo 3S Cutoff project"
summary: "An analog battery-disconnect circuit with voltage and thermal shutdown paths, hysteresis, and a battery-level indicator."
category: "Power"
status: "Design documented"
tags: ["LiPo", "Comparators", "Thermal cutoff"]
order: 4
role: "Analog circuit design, PCB layout & enclosure integration"
tools: ["KiCad", "3D enclosure models"]
---

## The project

This circuit is intended to disconnect a load from a three-cell LiPo supply when operating conditions fall outside the selected voltage or temperature thresholds. It uses analog circuitry rather than relying on a microcontroller to make the cutoff decision.

## Circuit architecture

The board includes an **LM4040 2.5 V reference**, an **LM324B**, **TLV171** and **TLV1812** devices, an **SI7153DN** switching MOSFET, and smaller **2N7002** control transistors. The schematic separates `Voltage Shut Off`, `Thermal Shut Off`, `Multi-Cell VRef`, and `Battery Level Meter` sections.

The signal names make the power path explicit: `Batt+`, `Batt+_Fused`, `Output_En`, and `PMOS_EN`. A resettable-fuse part is present in the placed board. Switch settings and resistor networks configure the analog behavior.

Schematic annotations describe a nominal **9.9 V** example for the three-times reference setting, roughly **0.3 V** of voltage hysteresis, and a thermal shutdown/reset example around **55 C / 40 C**. These are design annotations, not measured trip points or universal battery recommendations.

<figure class="prototype-photo">
	<img src="/images/projects/lipo-3s-cutoff/prototype.png" alt="LiPo 3S Cutoff prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Avoiding chatter:** removing a load can let battery voltage recover, so a clean disconnect requires appropriate hysteresis and reset behavior.
- **Threshold accuracy:** reference, resistor, sensor, and comparator tolerances all contribute to the actual switching points.
- **Power-path heating:** connector resistance, copper geometry, and MOSFET dissipation matter under sustained load.
- **Protection scope:** a pack-level cutoff is not the same as per-cell monitoring or cell balancing.

## Validation to document

Trip-point measurements across temperature, loaded voltage sweeps, reconnect behavior, and thermal tests are still needed to establish operating limits. This case study does not present the circuit as a certified battery-management system or a replacement for appropriate cell-level protection.