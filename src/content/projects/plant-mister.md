---
title: "Plant Mist Sprayer"
image: "/images/projects/plant-mister/final.jpg"
imageAlt: "Plant Mister final-project photo placeholder"
summary: "A battery-powered misting controller with adjustable interval and duration, and a real-time clock."
category: "Automation"
status: "Prototype Completed"
tags: ["SAMD09", "RTC", "Timed control"]
order: 19
tools: ["KiCad", "Mechanical CAD exports"]
---

## The project

I have a few plants that will thrive in high humidity. But living in Colorado means that it will never be high humidity. So I created a device that will create a localized high-humidity zone periodically throughout the day.

## System architecture

The project started out using an ESP32, and I connected that to Home Assistant for smart home control. But I realized that it wasn't the best solution for this project. Battery life is a big concern, and because this uses a small ultrasonic mister, it is power-hungry. Having an ESP32 connect periodically to get the current time (because its onboard RTC isn't very accurate) wasn't the best idea. So I decided to make this into a simple timed device. I used an external RTC and a SAMD09 to control it. The design uses an LED bar to indicate the interval; each lit LED indicates ~1.5 hours. It is controlled with a single button press to increase the time. Simple.


## Engineering challenges

- **Timing without unnecessary power use:** a dedicated clock separates scheduling from the controller's active runtime.
- **Output-power transients:** switching the misting load must not reset the controller or corrupt timing inputs.
- **Wet-environment integration:** enclosure placement and connector protection are part of the system, not properties guaranteed by the PCB.
