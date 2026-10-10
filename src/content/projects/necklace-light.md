---
title: "Necklace Light"
image: "/images/projects/necklace-light/final.jpg"
imageAlt: "Necklace Light project"
tileImagePosition: "center -100px"
summary: "A compact wearable-light power board with an adjustable regulator, physical controls, and a custom pendant enclosure."
category: "Wearables"
status: "Design documented"
tags: ["Wearable lighting", "Adjustable regulation", "Enclosure"]
order: 2
role: "Circuit design, PCB layout & enclosure integration"
tools: ["KiCad", "3D enclosure models"]
---

## The project

The necklace-light design focuses on fitting a light's supply and controls into a small wearable assembly. The electrical and enclosure files address the circuit, battery connection, adjustment access, and the pendant's physical form.

## Hardware approach

The main placed board uses a **TLV75801** adjustable regulator, a trimmer potentiometer, a miniature slide switch, filtering capacitors, and battery/output connections. Its schematic is organized into battery, filtering, voltage regulator, connector, and output sections.

A regulator annotation records an adjustment example of approximately **3.05 V to 5.55 V** for the noted resistance range. That documents the circuit's intended adjustment relationship; it is not a validated output range for every assembled variant.

The archive also contains a separate variant folder named `necklace_light_attiny202`. That name alone does not establish an installed microcontroller or RGB-animation firmware in the main design, so this write-up focuses on the documented regulator-based board. Body, top, and knob models show the accompanying enclosure work.

<figure class="prototype-photo">
	<img src="/images/projects/necklace-light/prototype.png" alt="Necklace Light prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Small, usable controls:** adjustment and switch access must remain practical when the circuit is inside a pendant.
- **Battery headroom:** an adjustable linear regulator cannot boost its input; the usable output depends on the actual battery supply and dropout conditions.
- **Wearable packaging:** connections, strain relief, light placement, and heat near the wearer need to be considered together.

## Details to add

Photos of the light and enclosure, the intended battery arrangement, the actual light source, brightness measurements, and runtime would complete the story without assuming an LED type or effect that the main board does not document.