---
title: "Necklace Light"
image: "/images/projects/necklace-light/final.jpg"
imageAlt: "Necklace Light project"
tileImagePosition: "center -100px"
summary: "A compact wearable-light power board with an adjustable regulator, physical controls, and a custom pendant enclosure."
category: "Wearables"
status: "Design Completed"
tags: ["Wearable lighting", "Adjustable regulation", "Enclosure"]
order: 2
tools: ["KiCad", "3D enclosure models"]
---

## The project

I had a few goals for this project:
1. Make it look like light is being emitted from a pendant.
2. Create the illusion that the pendant is emitting the light with no wires or batteries powering it.
3. Make it rechargeable.

It's easy enough to use a button-cell battery and a resistor to make an LED turn on. With enough power, the LED can shine for a while, but you lose a lot of power because of the resistor. This design uses an adjustable regulator to control the brightness of the LED and adds a tiny potentiometer to adjust the brightness.

## Hardware approach

The board uses a **TLV75801** adjustable regulator to control the LED brightness. A pot is used to adjust the feedback to change the output current. Those are simple enough, but the tricky part was finding a small enough LiPo battery for this design. Since it was going to be on the back of a necklace, it had to be super lightweight and small so it would be virtually unnoticeable to the wearer and wouldn't pull back on the necklace.

Due to the size, a charger and circuit could not be added into the necklace itself. So a small pogo-pin connector was added to the design. A separate charger and charging receptacle were created so the device could attach and charge.

To deliver power to the LED, small 28 AWG wire was woven into the necklace chain and connected to the LED mounted on the back of the pendant. The wire is visible if someone gets close enough and stares at it, but from normal conversation distance, the wire can't be seen! I had my doubts about the wire not breaking, but surprisingly it has been holding up. I stiffened the connections of the wire to the bullet connectors.

I experimented with using the chain as a power path, but ran into a few issues. Even with a silver chain, the resistance was high. This was causing a high power loss. The other issue was that when the user would move and walk, the chain would wiggle, and that was enough to interrupt power to the LED, causing it to blink.

<figure class="prototype-photo">
	<img src="/images/projects/necklace-light/prototype.png" alt="Necklace Light prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Small, usable controls:** adjustment and switch access must remain practical when the circuit is inside a pendant.
- **Battery headroom:** an adjustable linear regulator cannot boost its input; the usable output depends on the actual battery supply and dropout conditions.
- **Wearable packaging:** connections, strain relief, light placement, and heat near the wearer need to be considered together. It was very hard to find a connector that was conductive and strong enough to be used as a latch for the necklace. It needed to be a connector and latch in one so the user would not have to undo two latches to remove the necklace (one for the chain and the other for the power).

