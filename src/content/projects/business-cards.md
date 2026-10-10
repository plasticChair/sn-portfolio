---
title: "Business Cards"
summary: "A custom PCB business card combining visual identity with an NFC-tag circuit and compact LED circuitry."
image: "/images/projects/business-cards/final.jpg"
imageAlt: "Business Cards project"
category: "Wireless"
status: "Design documented"
tags: ["NFC", "PCB design", "NT3H1101"]
order: 15
role: "Circuit design, PCB layout & visual design"
tools: ["KiCad", "PCB fabrication files"]
---

## The project

A business card is an opportunity to make the medium part of the introduction. This design uses a custom circuit board to bring visual identity and an NFC-tag circuit into the same object.

## Board and circuit

The reviewed PCB has a **90 × 50 mm** rectangular outline. Logo artwork appears on copper, solder-mask, and silkscreen layers, making the board finish part of the graphic design rather than an afterthought.

The placed components include an **NT3H1101W0FHKH** NFC-tag IC, a capacitor, a resistor, and an LED. The schematic identifies antenna connections as `LA` and `LB` and includes a loop-antenna symbol. Some component values remain generic, so the assembled revision and actual antenna connections need checking before assigning electrical operating limits.

The archive includes earlier board revisions, a STEP export, and Gerber files. These document design iteration and manufacturing preparation, not a measured NFC read range or proof of a particular encoded payload.

<figure class="prototype-photo">
  <img src="/images/projects/business-cards/prototype.jpg" alt="Business Cards prototype or NFC PCB" width="1600" height="1000" loading="lazy" />
  <figcaption>Prototype / NFC circuit detail</figcaption>
</figure>

## Engineering challenges

- **Graphics and circuitry sharing a board:** copper artwork, component placement, and routing need to work together without compromising readability or the antenna area.
- **NFC coupling:** antenna geometry, tuning, nearby metal, and the way a card is presented to a reader affect a reliable tap interaction.
- **A usable physical object:** board edges, exposed components, and finish selection matter for a card that is handled and carried.
- **Assembly and encoding:** component choices and the programmed tag content need to match the actual manufactured revision.

## Validation to document

Photos of the finished card and the circuit side, the selected component values, the encoded content, and read tests with actual devices would complete the case study. No read-distance, phone-compatibility, or LED behavior claim is inferred from the design files alone.