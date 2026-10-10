---
title: "MultiCamera"
image: "/images/projects/multicamera/final.jpg"
imageAlt: "MultiCamera project"
summary: "A four-input video-switching board for the Tacoma, with camera-selection controls and front/rear override logic."
category: "Automotive"
status: "Design documented"
tags: ["Video switching", "Kinetis KL03", "Tacoma"]
order: 8
role: "Circuit design, PCB layout & embedded firmware"
tools: ["KiCad", "C", "NXP SDK"]
---

## The project

MultiCamera brings several camera feeds into one selected video output for the Tacoma. The design combines analog video routing, camera power connections, and control firmware that responds to front, rear, and reverse-related inputs.

## Hardware architecture

The schematic provides four video connections and a **MAX4565** analog switching IC. A dedicated **MKL03Z16** controller drives the channel-selection lines; it selects the video path rather than digitizing and processing the camera image.

An **AP63203** step-down regulator supplies the 3.3 V logic rail from the 12 V input. Coaxial video connections, 75-ohm resistors, camera power outputs, filtering components, and an SWD debug connection complete the interface. Separate power, microcontroller, and signal/video sheets keep those functions distinct.

## Selection behavior

The application source includes front, rear, reverse, and no-input states. GPIO interrupts detect input changes, timer events control transitions, and channel-selection GPIOs choose the active feed.

The archived V3 application includes a timed front-camera selection after a reverse-related transition, manual override handling, and logic intended to avoid feedback from an asserted override. Multiple application variants document iteration on the interaction model; their folder names are not treated as proof of field reliability.

<figure class="prototype-photo">
	<img src="/images/projects/multicamera/prototype.png" alt="MultiCamera prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Predictable priorities:** reverse activation, manual camera selection, and timeout behavior can conflict unless the state transitions are explicit.
- **Analog video integrity:** connector termination, routing, and return paths need attention independently of the digital controller.
- **Vehicle power and wiring:** noisy supply conditions and long harness connections make filtering and reset behavior important.
- **Integration:** camera power, display switching, and vehicle signals must be checked as one system rather than isolated board functions.

## Validation to document

Photos of the Tacoma installation, harness routing, video captures, switch-state tests, and power-transient measurements would establish the deployed behavior. Video format, field reliability, and automotive qualification are not inferred from the circuit alone.