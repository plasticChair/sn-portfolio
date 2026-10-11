---
title: "Audio Reactive Wrist Light"
image: "/images/projects/wrist-light/final.jpg"
imageAlt: "Wrist Light project"
summary: "A wearable light that flashes to the music!"
category: "Wearables"
status: "Design documented"
tags: ["Analog electronics", "Microphone", "Wearable lighting"]
order: 1
tools: ["KiCad", "PCB fabrication files"]
---

## The project

The idea for this project came from a YouTube video I saw, where small light strips were put into the glass tube of a fuse. I figured I could make a necklace or bracelet from that design. I decided to make this another analog project and add audio reactivity to it!

## Circuit architecture

There are two main parts to this design: the LED driver and the audio reactivity.
The LED driver uses a **TLV75801** adjustable regulator for brightness control and a 4-pole slide switch to control the brightness.

The audio-reactive part is a little more complicated. It uses an amplifier stage to amplify the microphone signal, and then a two-stage low-pass filter to condition the signal it sends to the NMOS to turn the LEDs on or off. The filters were tuned to 300 Hz to respond only to the bass frequencies. This makes it easier to see that the lights are reacting to the music.

## Bracelet Design

I'm not in the jewelry-making business (yet...), so I decided the easiest and cheapest metal to work with was copper. So I bought some copper tube that was the same diameter as the glass fuse tubes and used 14 AWG wire (from Home Depot) as the band. This would provide a rigid enough bracelet so it could stay on the wrist. I also added a magnetic clasp on the end for extra security.

<figure class="prototype-photo">
	<img src="/images/projects/wrist-light/prototype.png" alt="Wrist Light prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Small microphone signals:** gain, biasing, and filtering must make the input usable without amplifying supply noise or movement-induced interference.
- **Load-to-input coupling:** changing light current must not feed back into the sensitive analog input through shared supply or return paths.
- **Wearable adjustment:** gain or output adjustment has to remain accessible without compromising the enclosure or wiring.
