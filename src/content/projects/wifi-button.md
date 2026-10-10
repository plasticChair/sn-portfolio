---
title: "WiFi Button"
image: "/images/projects/wifi-button/final.jpg"
imageAlt: "WiFi Button project"
summary: "A battery-powered ESP32 button with charging, a power-control interface, and local status indication."
category: "Wireless"
status: "Design documented"
tags: ["ESP32", "Battery power", "Button interface"]
order: 14
role: "Circuit design, PCB layout & enclosure integration"
tools: ["KiCad", "Mechanical CAD exports", "PCB assembly files"]
---

## The project

WiFi Button is a dedicated wireless-input device: a physical button, an ESP module, and the power circuitry needed for a battery-powered assembly. The hardware keeps the interaction small while leaving the triggered action to application firmware.

## Hardware architecture

The placed module is an **ESP32-SOLO-1**. A **BQ21040** charger and an **LM3671** regulator support the battery and logic supply, while the user-interface sheet includes a physical pushbutton, an **FDW254P** switching device, and transistor/diode circuitry.

Signals named `Button_State`, `GPIO_PWR`, `GPIO_LED`, and `BATT_SWITCH` connect the button and power-control behavior to the controller. A status LED provides an output interface.

UART receive/transmit, reset, boot selection, and JTAG signals provide programming and debug access. Although one connector uses a footprint named for an ARM debug header, its actual labels include `TMS`, `TDI`, `TCK`, and `TDO`; the footprint name is not proof of an ARM SWD interface or a USB-to-UART bridge.

Multiple enclosure exports accompany the board, addressing button placement, battery fit, and connector access. A specific cloud endpoint, home-automation integration, or confirmed action/acknowledgment workflow is not established by the reviewed hardware files.

<figure class="prototype-photo">
	<img src="/images/projects/wifi-button/prototype.jpg" alt="WiFi Button prototype or internal PCB" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Power control versus usability:** the button interaction needs to wake or power the system predictably without requiring excessive idle consumption.
- **Connection latency:** network startup and acknowledgment affect how a user perceives a successful press.
- **Useful feedback:** a local indication should distinguish an input being detected from the remote action actually completing.
- **Enclosure integration:** antenna clearance, charging access, switch travel, and battery connections need to work together.

## Validation to document

The chosen application, power/wake sequence, action latency, offline behavior, battery runtime, and final enclosure photos would turn the hardware design into a complete interaction case study. No deployed cloud service or battery-life figure is assumed.