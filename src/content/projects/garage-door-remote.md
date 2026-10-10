---
title: "Garage Door Remote"
image: "/images/projects/garage-door-remote/final.jpg"
imageAlt: "Garage Door Remote project"
summary: "A paired LoRa transmitter and receiver with custom boards, packet validation, and a momentary isolated relay output."
category: "Wireless"
status: "Design documented"
tags: ["LoRa", "SAMD11", "Tx / Rx"]
order: 12
role: "Circuit design, PCB layout & embedded firmware"
tools: ["KiCad", "C", "Atmel START", "AVR firmware archive"]
---

## The project

This project covers both halves of a custom garage-door control link: a portable transmitter and a receiver connected to a momentary control interface. Keeping Tx and Rx together makes the radio, packet handling, and output behavior one system-level story.

## Paired hardware

Both current PCB designs contain an **ATSAMD11D14A** and a **LoRa1276** module. The transmitter adds a **BQ21040** charger, an **LM3671** regulator, buttons, and a status indicator. The receiver has an **LM3671**, interface connectors, and a **CPC1006NTR** isolated solid-state relay output.

The source tree contains both older AVR transmitter experiments and a SAMD11 implementation. Those are separate development paths, not evidence of two MCUs operating together on the current transmitter.

## Firmware behavior

The SAMD11 transmitter initializes the radio over SPI, initializes a nonce, and sends a validation packet on a repeating loop. The reviewed application is a repeated-send implementation, not a confirmed final button-to-sleep workflow.

The receiver calls `auth_verify` before actuating its output. On the first accepted packet of a stream, it asserts `Door_Relay` for **750 ms**. Continued accepted packets refresh the stream state rather than immediately firing another pulse. A timeout allows another stream, and the loop feeds a watchdog.

The verifier checks an eight-byte packet containing a nonce and token against a local hash calculation. That is documented validation logic, not a security certification. The reviewed verifier does not track previously accepted nonces, so replay resistance must not be assumed. No keys or credential values are reproduced in this portfolio.

<figure class="prototype-photo">
	<img src="/images/projects/garage-door-remote/protoype.jpg" alt="Garage Door Remote prototype or internal PCB" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **One action per intended command:** repeated radio packets should not translate directly into repeated opener activations.
- **Radio loss and feedback:** sending a packet does not prove that the receiver acted or that the physical door moved.
- **Control-interface compatibility:** relay pulse length and wiring must match the specific opener installation without bypassing its safety functions.
- **Access-control design:** freshness checks, key handling, replay behavior, and recovery need explicit review before relying on the link for access control.

## Validation to document

Bench Tx/Rx tests, packet-loss behavior, relay timing, the actual opener interface, and an access-control review are needed to establish operating limits. No universal opener compatibility, guaranteed range, or verified door-state feedback is claimed.