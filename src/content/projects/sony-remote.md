---
title: "Sony Remote Modchip for Added Volume Control to an External Receiver"
image: "/images/projects/sony-remote/final.jpg"
imageAlt: "Sony Remote project"
summary: "A custom volume-control interface using an ATtiny45, stored command patterns, and timer-driven output firmware."
category: "Interfaces"
status: "Design documented"
tags: ["ATtiny45", "Remote control", "Timer firmware"]
order: 13
tools: ["KiCad", "AVR C", "Atmel Studio", "MPLAB project files"]
---

## The project

I bought a new Sony TV and it's great. I have a very old surround sound system with a receiver too, and it's great. What's not great is that the way I control audio from the TV to the receiver is with optical audio, which doesn't allow for volume adjustment like a modern HDMI-controlled receiver allows. This meant I was forced to use two remotes: one for only sound adjustment and the other for all other TV controls. This minor everyday inconvenience is unacceptable.

## Reverse Engineering

Two things needed to be figured out:
1. The IR signal used to control the receiver's volume.
2. The button on the Sony TV remote used to control volume.

#1 was the easy part. Clip a scope probe to the IR LED and record the signal for volume up and down. It's a modulated PWM signal, and once that is measured, it can be recreated.

#2 was much harder. It required figuring out how the remote worked and following traces on the PCB. Since remotes have many buttons, charlieplexing is generally used. Once I figured out which signals to probe and the timing for the signals, I could then use a microcontroller to monitor those signals and figure out when volume up or down was pressed.

## Board and input interface

Since battery power is limited on a remote, I needed all the electronics I added to this remote to be off when the volume button is not pushed. So I added an NMOS to control power to my circuit and had that be controlled by a signal on the Sony remote. The microcontroller used was an **ATtiny45V** for its small size and low-power capabilities.

This newer Sony remote uses an RF connection to talk to the TV. This is great because the IR LED in the remote is only used for powering on the TV and is unused at all other times. This means I can take control of the IR LED for my volume control! When the ATtiny detects volume up, it pulses the IR LED to match the IR command for the receiver, and it does the same for volume down.


<figure class="prototype-photo">
	<img src="/images/projects/sony-remote/prototype.jpg" alt="Sony Remote prototype or internal PCB" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Reproducing the target signal:** command bits, burst timing, clock setup, and electrical/optical output all need to match the specific receiving device.
- **Detecting the volume buttons:** The signals I was looking for were very small and slim pulses. The ATtiny just barely had enough time to turn on and look for the signal in the small window it takes the user to push the volume button.
- **Limited space:** There was minimal room in the remote itself. I was lucky enough to have enough room to make a thin PCB cut a certain way to make it fit. You would never know the remote is modified just by looking at it.