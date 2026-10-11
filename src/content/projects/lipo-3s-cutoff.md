---
title: "LiPo 1-3S Cutoff"
image: "/images/projects/lipo-3s-cutoff/final.jpg"
imageAlt: "LiPo 3S Cutoff project"
summary: "An analog battery-disconnect circuit with voltage and thermal shutdown paths, hysteresis, and a battery-level indicator."
category: "Power"
status: "Design documented"
tags: ["LiPo", "Comparators", "Thermal cutoff"]
order: 4
tools: ["KiCad", "3D enclosure models"]
---

## The project

I commonly use LiPo and Li-ion batteries in many of my projects. While many batteries have low-voltage and short-circuit protection in them, the low-voltage protection typically cuts in around 2.7 V or lower. In order to extend the life of these types of batteries, it's best not to let them discharge below 3.3 V (typically that's when 80% of the battery's capacity is depleted). Surprisingly, it's practically impossible to find a simple little cutoff protection board to do this. It's 2026 and I would have thought this would have existed as a standalone module by now. Apparently not, so I designed a board that will cut off a user-selectable 1-3S battery at 3.3 V (or when the PCB gets too hot).

## Circuit architecture

The design is relatively simple. Produce a reference voltage and compare the battery voltage to the reference. If the battery is below the reference, then disable the high-side PMOS to cut power from the battery. And if you have a 2S battery, well then you just need to scale the reference voltage by 2x and 3x for 3S. The user switch selects the gain of the op-amp in order to scale the reference voltage appropriately.

With some added hysteresis and a thermal shutoff circuit as well, we have the final design!



<figure class="prototype-photo">
	<img src="/images/projects/lipo-3s-cutoff/prototype.png" alt="LiPo 3S Cutoff prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Avoiding chatter:** removing a load can let battery voltage recover, so a clean disconnect requires appropriate hysteresis and reset behavior.
- **Threshold accuracy:** reference, resistor, sensor, and comparator tolerances all contribute to the actual switching points.
- **Power-path heating:** connector resistance, copper geometry, and MOSFET dissipation matter under sustained load. The design is limited to 6 A (set with a polyfuse).
- **Protection scope:** a pack-level cutoff is not the same as per-cell monitoring or cell balancing.  The design is not meant to monitor each cell and assumes the pack has been balanced before use.
