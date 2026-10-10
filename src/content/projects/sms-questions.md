---
title: "SMS-Questions"
summary: "Daily questions and response summaries over SMS for FREE! Done by using a local Android gateway and an isolated Proxmox-hosted application on my home server.  This allows for a large number of users to use this service without having to download a seperate app"
category: "Software"
tags: ["SMS", "Android", "Node.js", "Express", "MySQL", "Proxmox", "Self-hosted"]
image: "/images/projects/sms-questions/architecture.png"
imageAlt: "Architecture illustration: an Android SMS gateway exchanges questions and replies over Wi-Fi with a locally hosted application on a Proxmox home server."
order: 8
role: "Application development & local deployment"
tools: ["Node.js", "Express", "MySQL", "node-cron", "Android SMS gateway", "Proxmox"]
---

## The project

SMS-Questions sends daily questions by text message and collects replies without requiring participants to install a separate app. The application supports pairing participants, scheduling questions, tracking responses, and sending summaries. Message commands provide an interface for joining, pairing, and changing preferences.

The phone is the SMS interface, not the application host. I run the webserver locally on Proxmox on my home server, with a local Android phone providing the SMS gateway.

The cover is an architecture illustration, not a photograph of my phone or server rack, or a screenshot of the live interface.

## Local deployment

My deployment is isolated: the only way for an external participant to communicate with the application is through the Android phone. The phone communicates with the locally hosted application and SMS gateway over Wi-Fi; the webserver is not directly exposed to participants on the Internet.

Incoming messages travel from the cellular SMS network to the Android phone, then across the local Wi-Fi connection to the application's incoming-message handler. Outgoing questions and summaries take the reverse route: the home-server application asks the Android gateway to send an SMS, and the phone delivers it through the cellular network.

Proxmox hosts the server-side application; the Android device supplies the connection between the cellular network and the local service. This is the deployment arrangement, not an air gap or a claim of independently verified security. The phone and its Wi-Fi connection remain part of the system's trust boundary.

## Application architecture

The server uses **Node.js and Express**, with **MySQL** storing users, pairings, questions, sessions, responses, and message state. Scheduled jobs use **node-cron** to check when questions are due and maintain daily sessions.

An incoming SMS handler routes participant commands and replies into the appropriate workflow. Incoming-message tracking supports duplicate detection, while outgoing-message records track send state and support retry handling. Response processing connects each reply to a question session and prepares a summary when the required responses have arrived.

The source also contains subscription-controlled conversation forwarding, allowing paired participants to continue an exchange through the gateway after answering a question. This capability is distinct from the basic daily-question workflow; it is not a claim about subscriber counts or commercial use.

## Engineering considerations

- **Message state:** repeated callbacks, delayed replies, and retries need to be distinguished from new answers so a question is not processed twice.
- **Scheduling:** daily questions must respect participant preferences and session boundaries rather than relying on a single untracked timer.
- **Device availability:** gateway connectivity, phone power, and cellular service affect delivery even when the home-server application is running.
- **Local boundaries:** Wi-Fi access and gateway endpoints need appropriate controls; local hosting alone does not establish authentication or confidentiality.
- **Personal data:** phone numbers and responses are private application data, not portfolio assets. No participant records, message contents, credentials, or database backups are published here.

## Deployment record

The Android phone, local Wi-Fi connection, and Proxmox home-server deployment describe how I run this project. Delivery latency, uptime, recovery after gateway outages, and participant scale remain to be documented with actual observations; no measured performance or security certification is implied.