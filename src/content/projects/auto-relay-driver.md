---
title: "Auto Relay Driver"
image: "/images/projects/auto-relay-driver/final.png"
imageAlt: "Auto Relay Driver final-project photo placeholder"
summary: "A compact 12 V relay-interface circuit that separates the control input from the battery-powered output stage."
category: "Automotive"
year: 2020
status: "Design documented"
tags: ["Relay control", "MOSFETs", "12 V"]
order: 9
role: "Circuit design & PCB layout"
tools: ["KiCad", "Gerber fabrication files"]
---

## The project

This board provides a dedicated interface between a control signal and a battery-powered relay load. The schematic is titled **12V Relay Driver** and explicitly dated **June 1, 2020**.

## Circuit architecture

A three-pin input carries battery power, `In+`, and ground. The two-pin output exposes `Out+` and ground. A small control stage drives the output-switching stage, with gate-bias resistors and input conditioning around the interface.

The schematic references **AO4430A** and **FDW254P** devices and protection footprints named **SMAJ15CA**. Some legacy component values remain generic, so resistor/capacitor selections and symbol-to-footprint consistency need to be checked against the intended assembled revision before assigning detailed electrical ratings.

A previous revision and exported Gerbers are retained with the design, preserving the transition from circuit to board fabrication.

<figure class="prototype-photo">
	<img src="/images/projects/auto-relay-driver/prototype.png" alt="Auto Relay Driver prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>

</figure>

## Engineering challenges

- **Control-signal compatibility:** a vehicle or external controller's signal needs to produce an unambiguous output state across its real voltage range.
- **Inductive turn-off:** a relay coil stores energy, making the placement and selection of suppression components part of the switching design.
- **Default state:** biasing should keep the output predictable while an input is disconnected or power is changing.
- **Load sizing:** MOSFET loss, board copper, connectors, and coil requirements need to be evaluated together.

## Validation to document

The design records its purpose and interface, but not a tested relay-current rating or automotive transient compliance. An assembled-board photograph, the chosen relay, switching waveforms, and a thermal test would provide those missing limits.