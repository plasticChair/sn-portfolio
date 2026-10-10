---
title: "USB Mux"
image: "/images/projects/usb-mux/final.jpg"
imageAlt: "USB Mux project"
summary: "A two-path USB selector with current sensing and firmware-managed disconnect, switchover, and reconnect sequencing."
category: "Interfaces"
status: "Design documented"
tags: ["USB", "SAMD11", "State machine"]
order: 6
role: "Circuit design, PCB layout & embedded firmware"
tools: ["KiCad", "C", "Atmel START"]
---

## The project

Switching a USB connection is more than moving two data lines. USB Mux coordinates the physical signal path, power controls, and timing so a primary connection can give way to a secondary path and return when that path is removed.

## Hardware architecture

The board uses an **ATSAMD11D14A** controller and a **PI3USB102** USB switch. An **INA181** current-sense amplifier, a low-value sense resistor, an **LM321** amplifier, and power-switching circuitry provide the hardware for detecting the secondary condition and controlling the primary path.

The schematic explicitly documents `SEL = L, output = Primary` and `SEL = H, output = Secondary`. Signals include `OE`, `Primary_Pwr_En`, `USB_SEL`, primary/secondary indicators, and the data-pair connections. The PCB includes four copper layers.

## Firmware sequencing

The application defines five states: **idle, pull-low, grace, active, and reconnect**. It samples `ISENSE` on a 100 ms loop, debounces a detected condition, disables the USB switch, changes the primary-power and select controls, then enables the secondary path.

The code gives that path a two-second enumeration grace period and performs a staged reconnect when the secondary condition disappears. Primary, secondary, and heartbeat LEDs expose state, and the main loop feeds a watchdog. These are programmed delays and behaviors, not proof of compatibility with every USB device.

<figure class="prototype-photo">
	<img src="/images/projects/usb-mux/prototype.png" alt="USB Mux prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Host-visible disconnects:** a switch transition needs to be recognized as a connection change rather than leave a device in an ambiguous state.
- **Reliable presence detection:** startup current and brief load changes can look like plug/unplug events without filtering.
- **Signal and power integrity:** differential routing, return paths, and supply switching must all fit the connector layout.
- **Recovery:** interrupted enumeration or repeated connection changes should lead back to a predictable default state.

## Validation to document

Enumeration traces, a device/host compatibility matrix, switching waveforms, and measured current thresholds would establish the practical limits. USB-PD support, a certified data rate, and seamless switching are not assumed from the design alone.