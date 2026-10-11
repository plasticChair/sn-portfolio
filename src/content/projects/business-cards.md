---
title: "Business Cards"
summary: "A custom PCB business card combining visual identity with an NFC-tag circuit and compact LED circuitry."
image: "/images/projects/business-cards/final.jpg"
imageAlt: "Business Cards project"
category: "Wireless"
status: "Design documented"
tags: ["NFC", "PCB design", "NT3H1101"]
order: 12
tools: ["KiCad", "PCB fabrication files"]
---

## The project

A little bit ago I was looking up getting some business cards for when making contacts. But the thought occurred to me that getting regular paper business cards wasn't that impressive if you are trying to make a good impression. What better way to create a business card than with the skills you already have? So I decided to make one from a PCB! In addition to the card, it was possible to add an SMD NFC IC and antenna to easily direct someone to my website or save contact information with a tap and power an LED for added fun.

## Board and circuit

The PCB is a standard business card size with the logo, texture, and text on copper. The texture is just copper with the black solder mask over it. For added style, all exposed copper was ENIG-coated.

The NFC IC is an **NT3H1101W0FHKH**, which can be reprogrammed with the NXP NFC app on Android/iOS. Using an online calculator, the NFC antenna size could be calculated and designed, and then adding a capacitor, a resistor, and an LED were the only things remaining.


<figure class="prototype-photo">
  <img src="/images/projects/business-cards/prototype.jpg" alt="Business Cards prototype or NFC PCB" width="1600" height="1000" loading="lazy" />
  <figcaption>NFC in action with the LED lighting up</figcaption>
</figure>

## Engineering challenges

- **Graphics:** Designing the card was the hardest part for me. I was going for a very clean and practical look. I'm really fond of the black solder mask and the ENIG coating contrast.
- **NFC coupling:** Some of the texture and text is right behind the NFC antenna.  So I was unsure how well the antenna would work.  Fortunately, the antenna worked right away and the copper on the other side and edging didn't cause any issues.  

