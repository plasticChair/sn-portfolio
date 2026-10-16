---
title: "SMS-Questions"
summary: "Daily questions and response summaries over SMS for FREE! Done by using a local Android gateway and an isolated Proxmox-hosted application on my home server. This allows for a large number of users to use this service without having to download a separate app."
category: "Software"
tags: ["SMS", "Android", "Node.js", "Express", "MySQL", "Proxmox", "Self-hosted"]
image: "/images/projects/sms-questions/architecture.png"
imageAlt: "Architecture illustration: an Android SMS gateway exchanges questions and replies over Wi-Fi with a locally hosted application on a Proxmox home server."
order: 8
tools: ["Node.js", "Express", "MySQL", "node-cron", "Android SMS gateway", "Proxmox"]
---

## The project

The idea came from someone I used to date. Our texting styles and schedules were completely off (maybe a good sign not to date...). In order to help our communication, I decided to create something that would text us both a question in the morning. When both of us would respond, it would then send us each other's response. And yes, they do have apps for this, but we both found it a hassle to remember to log in to the app and click through the prompts and respond. The idea was to make this as simple and fluid as possible, and therefore use text messages.


## Local deployment

I searched online to find a solution for this. They have SMS services that one can use to send texts, and they charge anywhere from $0.005-$0.02 or so per text. Not a dealbreaker, but for some services, you had to be a bigger company or they charged you more. And there were some other annoyances I later found out about.

After some more research, I decided to self-host a solution instead, where the only cost was $6-8 a month for a SIM card with unlimited texts. I grabbed my old Android phone, found an open-source SMS gateway app someone made, modified the source to add support for MMS/RCS messaging, and created a Linux VM on my server to host the actual application. The interesting part about this design is that my app is actually isolated from the Internet. The only traffic allowed is through the Wi-Fi connection to my phone, and it rejects everything.

## Application architecture

The server uses **Node.js and Express**, with **MySQL** storing users, pairings, questions, sessions, responses, and message state. Scheduled jobs use **node-cron** to check when questions are due and maintain daily sessions.

An incoming SMS handler routes users' commands and replies into the appropriate workflow. Incoming-message tracking supports duplicate detection, while outgoing-message records track send state and support retry handling. Response processing connects each reply to a question session and prepares a summary when the required responses have arrived.


## Engineering considerations

- **Message state:** repeated callbacks, delayed replies, and retries need to be distinguished from new answers so a question is not processed twice.
- **Scheduling:** daily questions must respect participant preferences and session boundaries. Different time zones must also be considered.
- **Device availability:** gateway connectivity, phone power, and cellular service affect delivery even when the home-server application is running. One failure means a message won't be sent, so read receipts were important so I knew when to retry.
- **Personal data:** phone numbers and responses are private data.  So encryption is a must!
- **Bot Detection:** My SIM card would flag my texts as being from a bot and would block them if a response to a text was sent too fast. Throttling was needed to prevent this.
