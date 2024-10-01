---
icon: arrows-cross
cover: https://gitbookio.github.io/onboarding-template-images/header.png
coverY: 0
layout:
  cover:
    visible: true
    size: full
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Introduction

## The Basics

### What Does It Do?

In short, the \[Coze ↔ OpenAI ↔ LibreChat] Unified API Adapter facilitates the integration of the [Coze](https://www.coze.com/) API with the popular chat platform [LibreChat](https://www.librechat.ai/).&#x20;

LibreChat Info:&#x20;

* [Demo](https://librechat-librechat.hf.space/)
* [GitHub](https://github.com/danny-avila/LibreChat)&#x20;
* [Documentation](https://www.librechat.ai/docs)&#x20;

Coze.com Info:

* [User Guide](https://www.coze.com/docs/guides)
* [API Documentation](https://www.coze.com/docs/developer\_guides/coze\_api\_overview)

***

### Why Would I Want This?

Unfortunately, at the time of writing this, the Coze API protocol is not OpenAI-friendly. There are certain differences it has mostly due to the fact that it needs to handle the complexities of being agentic.&#x20;

***

### How Does It Work?

1. The adapter first receives a chat request from LibreChat via the OpenAI API protocol.
2. The request is then translated into a Coze-friendly format.
3. A request to the Coze API is made using the predefined settings.
4. The response from Coze is then streamed and translated back into an OpenAI API format that LibreChat can understand.

***

## LibreChat

LibreChat is a free, open source AI chat platform. This Web UI offers vast customization, supporting numerous AI providers, services, and integrations.

LibreChat's OpenAI-ish interface boasts speed and a wealth of functionality. Because of a massive collaborative effort to build the application, it consistently stays feature-rich, secure, and one of the best web applications for LLM chatting.

Some of major features include:

* Artifacts
* RAG
* Multi-Modal

[View the full feature list >](https://www.librechat.ai/docs/features)

***

## Coze

Coze is a next-generation low-code/no-code AI application and chatbot developing platform.

Beginners and experts alike can rapidly prototype AI bot ideas using the multitude of tools available in the software, or they can build their own APIs and complex systems all within the comfort of the Coze interface.

Some of major features include:

* Feature 1
* Feature 2
* Feature 3

### Building Chatbots

### Coze API

***

## OpenAI Schema Protocol

OpenAI has become the gold standard of LLM chatting, so it is no surprise many have adopted their request and response schema as standard protocol when building applications.

{% embed url="https://platform.openai.com/docs/api-reference/chat" %}

***

## **Functional Highlights**

* **Image Upload Handling:**
  * Detects images within messages that are encoded as data URLs.
  * Uploads images to the Coze API before forwarding the message.
  * Replaces image data with a `file_id` reference to the uploaded image.
* **Streaming Responses:**
  * Supports streaming of responses from the Coze API to the client.
  * Processes different event types to handle message deltas, completions, and conversation endings.
* **Middleware Usage:**
  * Utilizes CORS to allow cross-origin requests.
  * Parses large payloads up to 50MB, accommodating messages with sizable content (e.g., images).
* **Robust Error Handling:**
  * Logs detailed error information for debugging.
  * Provides meaningful error responses to the client.

***

## Getting Started

To get started, this documentation will walk you through a three-step process consisting of the following:

1. [Build a Coze Bot >](getting-started/build-a-coze-bot.md)
2. [Install LibreChat >](getting-started/install-librechat.md)
3. [Install API Adapter >](getting-started/install-api-adapter.md)

It is important, especially if you are unfamiliar with these systems, to follow the process closely and not to omit anything.

## Support

Although there is no official support for this adapter or LibreChat, feel free to contact us through Github for assistance in setting this up for a small fee.&#x20;
