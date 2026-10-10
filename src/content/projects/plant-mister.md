---
title: "Plant Mister"
image: "/images/projects/plant-mister/final.png"
imageAlt: "Plant Mister final-project photo placeholder"
summary: "A battery-powered misting controller with adjustable interval and duration, a real-time clock, and manual activation."
category: "Automation"
status: "Design documented"
tags: ["SAMD09", "RTC", "Timed control"]
order: 19
role: "Circuit design, PCB layout & hardware integration"
tools: ["KiCad", "Mechanical CAD exports"]
---

## The project

Plant Mister brings scheduled operation and a manual override to a misting setup. The board provides separate controls for how often misting occurs and how long it runs, alongside battery charging and switched output power.

## System architecture

The placed board uses an **ATSAMD09D14A** microcontroller and an **RV-3028** real-time clock. The schematic labels `Period_Adjust` and `Duration_Adjust` identify the timing controls, while `ManualEn`, `Mister_En`, and `Mister_Out` separate the manual input from output actuation.

The power section contains a **BQ21040** single-cell charger, an **LM3671** regulator, and a **TPS61232** boost converter, with a `5V_En` control signal. The board also includes an **APX803L** supervisor, indicator LEDs, USB charging, serial connections, and an SWD programming interface.

The I2C lines are consistent with the clock interface. They do not, by themselves, establish a soil-moisture sensor or closed-loop watering algorithm. The documented design is a timed controller; the exact external misting hardware remains a detail to confirm.

<figure class="prototype-photo">
	<img src="/images/projects/plant-mister/prototype.png" alt="Plant Mister prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Timing without unnecessary power use:** a dedicated clock separates scheduling from the controller's active runtime.
- **Clear adjustment behavior:** interval, duration, and manual activation need well-defined priorities and limits.
- **Output-power transients:** switching the misting load must not reset the controller or corrupt timing inputs.
- **Wet-environment integration:** enclosure placement and connector protection are part of the system, not properties guaranteed by the PCB.

## Validation to document

Useful additions include the connected misting device, timing accuracy, output-current measurements, battery runtime, and behavior during low battery or interrupted operation. No moisture-feedback performance or water-resistance rating is claimed here.