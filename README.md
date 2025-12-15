# 🚀 LeetCode Java Smart Assistant (LeetCode Java 智能助手)

[![Language](https://img.shields.io/badge/Language-Java-orange.svg)](https://www.java.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> 让 LeetCode 的网页编辑器拥有类似 IntelliJ IDEA 的智能提示体验。
> Make LeetCode editor feel like IntelliJ IDEA.

## 📖 简介 (Introduction)

LeetCode 原生编辑器对于 Java 的支持非常有限，经常需要手动输入完整的方法名，甚至容易记混 `length` 和 `length()`。

**LeetCode Java Assistant** 是一个基于 Tampermonkey 的用户脚本。它通过 hook LeetCode 底层的 Monaco Editor，实现了**上下文感知的自动补全**。当你输入 `.` 时，脚本会根据变量类型（String, List, Map 等）自动推荐相应的方法，并支持参数跳转。

## ✨ 核心功能 (Features)

* **🧠 智能上下文识别**：不只是简单的关键词匹配。脚本会分析你的代码，识别变量是 `String`、`List` 还是 `Map`，并只显示对应的方法。
    * 输入 `list.` -> 显示 `add`, `get`, `size`...
    * 输入 `str.` -> 显示 `substring`, `charAt`, `length`...
* **📝 代码片段 (Snippets)**：支持参数占位符。
    * 例如选中 `substring`，代码会自动补全为 `substring(${1:start}, ${2:end})`，按 `Tab` 键可快速切换参数。
* **🔌 广泛支持**：支持 `String`, `ArrayList`, `HashMap`, `HashSet`, `Stack`, `Queue`, `Deque`, `Arrays` 等常用算法竞赛类库。
* **🛡️ 安全无毒**：纯前端脚本，不上传任何代码，仅在本地浏览器运行。

## 🚀 安装 (Installation)

1.  **安装管理器**：首先安装 [Tampermonkey (油猴)](https://www.tampermonkey.net/) 浏览器扩展。
2.  **安装脚本**：
    * 新建脚本->把js源码复制进去 [👉 点此查看源码 (GitHub)](./leetcode-java-assistant.user.js)

## 🛠️ 支持的 API 列表 (Supported APIs)

目前脚本内置了算法题中最常用的 API：

| 类型 (Type) | 支持方法 (Examples) |
| :--- | :--- |
| **String** | `length()`, `charAt()`, `substring()`, `equals()`, `toCharArray()`, `trim()`, `split()`... |
| **List / ArrayList** | `size()`, `add()`, `get()`, `remove()`, `contains()`, `isEmpty()`, `toArray()` |
| **Map / HashMap** | `put()`, `get()`, `getOrDefault()`, `containsKey()`, `keySet()`, `values()`, `computeIfAbsent()` |
| **Queue / Deque** | `offer()`, `poll()`, `peek()`, `isEmpty()` |
| **Stack** | `push()`, `pop()`, `peek()` |
| **Arrays** | `sort()`, `fill()`, `length` (属性) |

## ⚙️ 原理 (How it works)

本脚本利用 `unsafeWindow` 穿透浏览器沙箱，获取 LeetCode 页面中的 `monaco` 编辑器实例。通过注册 `CompletionItemProvider`，并结合正则表达式对当前编辑器的代码进行轻量级扫描，从而实现对变量类型的推断。

## 🤝 贡献 (Contribution)

如果你发现有遗漏的常用 API，或者想要改进正则匹配逻辑：

1.  Fork 本仓库
2.  修改 `leetcode-java-assistant.user.js` 中的 `API_DB` 数组
3.  提交 Pull Request

## 📄 许可证 (License)

MIT License
