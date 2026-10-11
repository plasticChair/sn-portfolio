---
title: "Garage Door Remote"
image: "/images/projects/garage-door-remote/final.jpg"
imageAlt: "LoRa Garage Door Remote project"
summary: "A paired LoRa transmitter and receiver with custom boards, packet validation, to eliminate the annoyance of pressing the garage door button more than once."
category: "Wireless"
status: "Design documented"
tags: ["LoRa", "SAMD11", "Tx / Rx"]
order: 12
tools: ["KiCad", "C", "Atmel START", "AVR firmware archive"]
---

## The project

For some reason, ever since I moved into my house, my garage door openers just have never worked right. I have bought and tried a few different styles of remotes, and even up close, the garage door would never reliably open. I searched for some long-range garage openers, but didn't find anything I liked. Given how popular and impressive LoRa devices can be, I decided to design a new garage door opener that worked with one button press. Guaranteed to work with no frustration. Peace at last.


## Designed hardware

This design has two parts: a transmitter and receiver. Both devices will actually transmit and receive in this design, however (see next section). Both contain an **ATSAMD11D14A** and a **LoRa1276** module. The transmitter adds a **BQ21040** charger, an **LM3671** regulator, buttons, and an LED status indicator. The receiver has an **LM3671**, EEPROM, and a **CPC1006NTR** isolated solid-state relay output for signaling to the garage door.

## Designed behavior

Signal replay attacks have been around for a while now. And so I figured, the least I could do is protect against that. The idea behind this design is basically the same as rolling codes. You press the button and it sends a code to the garage door. The garage door then stores that code and marks it as being used, so it can't be repeated.

For this design, the user presses the button and it sends a signal to the garage door opener. The garage door opener receives the signal and sends a challenge code. The opener button responds back, and if it's valid, then the door opens. Once the challenge code is used, it will not be allowed to be used again.

In order to accomplish that, the opener button needs to latch power on when the user presses the button. This is because if the user only presses the button for 10 ms, this isn't enough time for the authentication process to be completed. So the user will press the button to wake up the opener, and the opener latches power, sends data to the garage door opener, waits for a response, and sends a packet back. If it receives a completion signal, then it shuts itself down. If it doesn't, then it tries again for three attempts. After three attempts, it turns itself off.

This process uses a bit more power than a typical remote, but this device is USB rechargeable, so you never have to replace batteries again. Already a win in my book.

<figure class="prototype-photo">
	<img src="/images/projects/garage-door-remote/protoype.jpg" alt="Garage Door Remote prototype or internal PCB" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Handling Used Codes:** Creating a long list of used codes and storing it in EEPROM can be tricky, especially when the list gets really long. Looking back at this, since there is an authentication sequence with a challenge code that changes every time (based on random noise), I don't think I needed to create a list of used codes, as it's the garage door opener itself that creates the challenge, not the transmitter.


## Final Thoughts

This was one of my most favorite and useful builds this year. No more aggravation when dealing with this opener. The range is up to 1/4 of a mile in my neighborhood. So far it's been working flawlessly!