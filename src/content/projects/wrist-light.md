---
title: "Wrist Light"
image: "/images/projects/wrist-light/final.jpg"
imageAlt: "Wrist Light project"
summary: "A wearable-light circuit that pairs adjustable power with a microphone and analog signal-conditioning circuitry."
category: "Wearables"
status: "Design documented"
tags: ["Analog electronics", "Microphone", "Wearable lighting"]
order: 1
role: "Analog circuit design & PCB layout"
tools: ["KiCad", "PCB fabrication files"]
---

## The project

Wrist Light combines the compact supply of a wearable light with a microphone-based input circuit. The board is an analog design rather than a documented Bluetooth device or microcontroller-driven RGB controller.

## Circuit architecture

The placed board includes a **TLV75801** adjustable regulator, a trimmer, a physical switch, an **LM321** amplifier, a **CMM-3125AT-42316-TR** microphone, and a **BSS316N** switching transistor. Resistor/capacitor networks surround the amplifier and output circuitry.

Labels such as `OpAmp_Neg`, `Vdiv`, `LED_BJT`, `LED_GND`, and `LED_RTN` identify the signal-conditioning and light-output portions of the circuit. Battery, filtering, regulator, and output sections organize the schematic. No fitted MCU appears in this board's placed values.

The hardware supports describing an audio-sensing light interface. The exact intended effect, response curve, and connected light source still need confirmation rather than assuming a particular animation or RGB arrangement.

<figure class="prototype-photo">
	<img src="/images/projects/wrist-light/prototype.png" alt="Wrist Light prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Small microphone signals:** gain, biasing, and filtering must make the input usable without amplifying supply noise or movement-induced interference.
- **Load-to-input coupling:** changing light current must not feed back into the sensitive analog input through shared supply or return paths.
- **Wearable adjustment:** gain or output adjustment has to remain accessible without compromising the enclosure or wiring.

## Validation to document

Input/output waveforms, response to ambient sound, the actual light assembly, battery arrangement, and runtime would show how the analog circuit behaves in use. No wireless functionality or tested brightness specification is claimed.