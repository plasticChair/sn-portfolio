---
title: "Automatic USB Detection Switch"
image: "/images/projects/usb-mux/final.jpg"
imageAlt: "USB Switch project"
summary: "A two-path USB selector with current sensing and firmware-managed disconnect, switchover, and reconnect sequencing."
category: "Interfaces"
status: "Design Completed"
tags: ["USB", "SAMD11", "State machine"]
order: 6
tools: ["KiCad", "C", "Atmel START"]
---

## The project

My Tacoma did not come with a wireless head unit. This meant that to use Android Auto, I had to plug my phone into the cord every time. I searched around and found someone who made a custom Android Auto wireless adapter using an old phone. Surprisingly, this actually worked, and that person went on to make the first wireless Android Auto adapter on the market (which other companies copied and took over the market). I ended up buying a wireless adapter and I thought my issues were over. Well, not quite: every time someone else was in the car with me and wanted to play music, they would have to disconnect my wireless adapter and plug in their phone, digging through my center console. And then I would have to put it all back after they left. Unacceptable.

Surprisingly, there isn't a device that can detect when a USB device is present and switch ports automatically, so I had to create one.  

## Hardware architecture

The board uses an **ATSAMD11D14A** controller and a **PI3USB102** USB switch for the USB switching. An **INA181** current-sense amplifier is used to detect when a device is plugged into the secondary USB port. The uC then tells the USB switch to switch ports, and the secondary device then connects to the output.




<figure class="prototype-photo">
	<img src="/images/projects/usb-mux/prototype.png" alt="USB Switch prototype" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

- **Host-visible disconnects:** a switch transition needs to be recognized as a connection change rather than leave a device in an ambiguous state.
- **Reliable presence detection:** startup current and brief load changes can look like plug/unplug events without filtering. Some low-power devices are not detected.
- **Signal and power integrity:** differential routing, return paths, and supply switching must all fit the connector layout.

