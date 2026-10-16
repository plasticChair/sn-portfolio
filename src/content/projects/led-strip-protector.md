---
title: "LED Strip Protector"
image: "/images/projects/led-strip-protector/final.jpg"
imageAlt: "LED Strip Protector Project"
summary: "An inline LED-strip board that combines a protected power switch with a buffered data path to reduce potential damage to the LED strip."
category: "Power"
status: "Design Completed"
tags: ["LED strips", "Load switching", "Signal buffering"]
order: 14
tools: ["KiCad", "PCB fabrication files"]
---

## The project

I have been designing more wearable projects recently. And most of them involve LED strips, down to 2.7 mm in width. The faults that I've seen that are more common are due to strain relief, or lack thereof. The idea behind this project was to stiffen the interface between the power/comm wires and the tiny 2.7 mm strips. This reduces the risk of the power wire shorting the data line and blowing the entire rest of the strip.

## The Design

The board uses an **AP22814BW5-7** power-distribution switch and an **SN74AHCT1G125** tri-state buffer to isolate the driver from the LED strip. With short-circuit protection, power will get cut to the LED strip if the input is shorted. In combination with the signal buffer, this will prevent the strip from being damaged if a wire shorts anything else.

The design was also duplicated for 5 mm and 9.5 mm LED strips as well. The design also includes notches on the PCB to allow for zip ties or other types of strain relief to be used.

## Engineering challenges

- **Power transitions and data behavior:** the signal path needs predictable behavior while the strip's supply is disabled or changing.
- **Load startup:** strip capacitance and turn-on current must be considered alongside the selected switch's limits and thermal behavior.
- **Small physical size:** 2.7 mm is small, and the PCB needs to be stiff and strong enough to be able to prevent bending.

