---
title: "Sony Remote"
image: "/images/projects/sony-remote/final.jpg"
imageAlt: "Sony Remote project"
summary: "A custom volume-control interface using an ATtiny45, stored command patterns, and timer-driven output firmware."
category: "Interfaces"
status: "Design documented"
tags: ["ATtiny45", "Remote control", "Timer firmware"]
order: 13
role: "Circuit design, PCB layout & AVR firmware"
tools: ["KiCad", "AVR C", "Atmel Studio", "MPLAB project files"]
---

## The project

Sony Remote is a focused custom-control design for volume commands, rather than a general-purpose learning remote. It combines a modified interface board with firmware that maps input states to stored output patterns.

## Board and input interface

The placed `remote_mod` PCB includes an **ATtiny45V**, an **MMBT3904** transistor, **MAX40200** devices, and connections labeled for I/O, programming, reset, and testing. The archive also contains an opto-related schematic variant and several firmware revisions.

The application samples three named input lines and uses their combinations to choose volume-up or volume-down. Those names are interface signals; they do not imply three RGB lighting channels.

## Firmware approach

The reviewed helper code stores distinct **four-byte command arrays** for volume-up and volume-down. A state machine steps through the command data while Timer1 controls the output timing. Pin-change interrupts, idle/power-down sleep routines, and a separate timeout timer manage responsiveness between commands.

The project establishes timer-driven remote-control signaling. It does not, by itself, justify labeling the output as a particular Sony SIRC variant, assigning a carrier frequency without verifying the clock configuration, or claiming compatibility across Sony devices.

<figure class="prototype-photo">
	<img src="/images/projects/sony-remote/prototype.jpg" alt="Sony Remote prototype or internal PCB" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Reproducing the target signal:** command bits, burst timing, clock setup, and electrical/optical output all need to match the specific receiving device.
- **Input transitions:** bouncing or partial input combinations should not generate the wrong volume command.
- **Sleep and responsiveness:** low idle activity needs to coexist with predictable wake-up and repeat behavior.
- **Verification access:** test outputs and retained signal-generator work provide places to observe timing rather than debug only by the target device's response.

## Validation to document

The exact Sony device, the physical connection or emitter arrangement, scope captures, command repetition behavior, and a working demonstration would complete the story. Only the documented volume-command implementation is described here.