---
title: "LED Strip Protector"
image: "/images/projects/led-strip-protector/final.jpg"
imageAlt: "LED Strip Protector project"
summary: "An inline LED-strip board that combines a protected power switch with a buffered data path in several connection widths."
category: "Power"
status: "Design documented"
tags: ["LED strips", "Load switching", "Signal buffering"]
order: 2
role: "Circuit design & PCB layout"
tools: ["KiCad", "PCB fabrication files"]
---

## The project

LED strips combine a power load and a digital signal on a small connection. This design places a switched power path and a signal buffer between the upstream connection and the strip, with layouts for different physical widths.

## Circuit architecture

The placed board components include an **AP22814BW5-7** power-distribution switch and an **SN74AHCT1G125** tri-state buffer. Nets distinguish incoming LED power, switched power, ground, and the data signal rather than treating the strip as a simple two-wire load.

The design archive contains **2.7 mm, 5 mm, and 9.5 mm** variants, as well as a combined design and panel files. Those versions address how the same circuit connects to different strip geometries. Fabrication BOMs and component-position files are available for the individual layouts.

<figure class="prototype-photo">
	<img src="/images/projects/led-strip-protector/prototype.png" alt="LED Strip Protector prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Power transitions and data behavior:** the signal path needs predictable behavior while the strip's supply is disabled or changing.
- **Load startup:** strip capacitance and turn-on current must be considered alongside the selected switch's limits and thermal behavior.
- **Small physical interfaces:** pad alignment, solder access, and trace area compete for space in the narrowest version.

## Validation to document

The board layout does not establish a tested current rating, cable length, or supported strip voltage. Load-startup measurements, fault response, data-waveform captures, and examples of the fitted strip connections would make those limits explicit.