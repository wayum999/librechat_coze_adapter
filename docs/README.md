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

### What Does It Do?

In short, the \[Coze ↔ OpenAI ↔ LibreChat] Unified API Adapter facilitates the integration of the [Coze](https://www.coze.com/) API with the popular chat platform [LibreChat](https://www.librechat.ai/).&#x20;

LibreChat Info:&#x20;

* [Demo](https://librechat-librechat.hf.space/)
* [GitHub](https://github.com/danny-avila/LibreChat)&#x20;
* [Documentation](https://www.librechat.ai/docs)&#x20;

Coze.com Info:

* [User Guide](https://www.coze.com/docs/guides)
* [API Documentation](https://www.coze.com/docs/developer\_guides/coze\_api\_overview)

### Why Would I Want This?

Unfortunately, at the time of writing this, the Coze API protocol is not OpenAI-friendly. There are certain differences it has mostly due to the fact that it needs to handle the complexities of being agentic.&#x20;

### How Does It Work?

1. The adapter first receives a chat request from LibreChat via the OpenAI API protocol.
2. The request is then translated into a Coze-friendly format.
3. A request to the Coze API is made using the predefined settings.
4. The response from Coze is then streamed and translated back into an OpenAI API format that LibreChat can understand.

### Jump right in

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>Getting Started</strong></td><td>Create your first site</td><td><a href=".gitbook/assets/1.png">1.png</a></td><td></td><td><a href="getting-started/quickstart.md">quickstart.md</a></td></tr><tr><td><strong>Basics</strong></td><td>Learn the basics of GitBook</td><td><a href=".gitbook/assets/2.png">2.png</a></td><td></td><td><a href="broken-reference">Broken link</a></td></tr><tr><td><strong>Publish your docs</strong></td><td>Share your docs online</td><td><a href=".gitbook/assets/3.png">3.png</a></td><td></td><td><a href="overview/publish-your-docs-1.md">publish-your-docs-1.md</a></td></tr></tbody></table>
