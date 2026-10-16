---
title: "FindMyFriends Compass"
image: "/images/projects/findme-compass/final.jpg"
imageAlt: "FindMyFriends Compass Project"
summary: "A compact platform combining GNSS, orientation sensing, and LoRa radio to send your current position to friends with the same device to help navigate to them."
category: "Wireless"
status: "Prototype Only"
tags: ["GNSS", "BNO086", "ESP32-S3", "VNA", "RF"]
order: 11
tools: ["KiCad", "Fusion CAD archive", "PCB assembly files"]
---

## The project

My friends and I were headed to a music festival, and with a group of eight of us, we knew we could not stay together the whole time. With no cell service in this area, we weren't sure what to do. I've used LoRa radios before for some other projects, and I thought about finding a solution with this. If I could just use GPS to get the user's current position, I could broadcast it out with the other devices listening and then easily point to where the other devices are. The only problem was I had 35 days and only one attempt to get the design correct and assemble four of these. With the strict timeline, I was trying to use off-the-shelf components as much as possible.

## Hardware architecture

The main PCB uses a **XIAO ESP32-S3 Plus** module. This is a well-documented and well-defined microcontroller that has loads of support. Using this minimizes errors related to power and I/O selection.

The GNSS selected for this was a **SAM-M10Q-00B**. It is a GNSS module and antenna all in one package. This meant no RF design or layout for me. This significantly improved my chances of having this module work.

For orientation I used a **BNO086**, which is a 9-axis IMU. This part got me spoiled (and for the price, it better have). Normally, I would use a 6-axis IMU with a 3-axis compass or a 9-axis IMU and calculate the quaternions myself. But this IC does it all for you in one package. No need to worry about sampling rates, silly math errors, or communication protocol faults. It was a simple drop-in solution. The other reason for this part selection was that it had tap and orientation detection, meaning I didn't have to add buttons for the user to interact with. The user could rotate, tap, double-tap, or shake the device to use it, further simplifying the hardware design.

For LoRa, I used an SX1262 module with a connector for an external antenna. This is a well-defined and widely used LoRa module that can have some impressive capabilities and range. There were already some libraries for this out there that I used. And I knew this was a safe part selection.

<figure class="prototype-photo">
	<img src="/images/projects/findme-compass/prototype.png" alt="FindMe Compass prototype or internal PCB photo placeholder" width="1600" height="1000" loading="lazy" />
	<figcaption>Prototype / internal PCB</figcaption>
</figure>

## Engineering challenges

There were so many unknowns with this design. Normally, I would go out and design and experiment with each unknown. But due to the strict timeline, that wasn't possible. The four devices that were built didn't work 100% as expected, and there were many issues that I anticipated. I think doing one or two more revisions would improve the results by 75% at least.


- **BNO086 is very heat-sensitive:** The BNO086 is a very tiny SMD package with narrow pin pitch. So soldering it would be hard enough, but this device in particular could not handle heat that well at all. I had to replace two units when reworking boards.

- **Calibration:** I noticed the compass would sometimes be unreliable. I think this was partially due to the heat sensitivity of the unit, like I mentioned earlier. But also, the IMU had to be surrounded by other components, which caused interference. Having each unit individually calibrated was important.

- **Slow valid fix:** I have used an older generation of the GNSS module before in the past, and it has always worked very reliably. But one of the goals of this project was to make this as small as possible. No one wanted to carry around a large device. If it wasn't practical enough to be used, it wasn't worth making. This meant the GNSS antenna only had a small view of the sky because the LoRa module and the LCD were crammed up right next to it. This severely attenuated the GNSS signal. And the lack of a ground plane around the antenna was also a factor in this. The next design would have a removable antenna so it could be placed away from components.

- **LoRa Performance:** I tested two different antennas: a flexible PCB and a coil antenna. The flexible PCB antenna was expected to have poor performance, so I wasn't anticipating anything out of it. The coil antenna had better performance after tuning with a VNA. But the range still didn't meet my expectations. At most, line-of-sight, I could just barely get 1/3 mile range. While this was decent, I was hoping to get more out of it. And with trees and other obstructions, this was significantly reduced. The module uses 2.4 GHz bands, which is part of the issue. I was tempted to use an SX1262, which operates around 900 MHz, but technically that would not have been FCC compliant.

## Final Thoughts

With only one revision of this and limited time, I think this is the output I was expecting, but not what I was hoping for. With limited GPIO of the XIAO ESP32-S3, poor antenna selection, and layout for the components, this design could have been greatly improved with another revision. I think the best part for me was that there weren't really any surprises, as I knew the risks and pitfalls of this design.

