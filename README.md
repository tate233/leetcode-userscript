#  (LeetCode Java 常用类方法显示助手)

> 让 LeetCode 的网页编辑器能够自动提示java的常用方法。

## 📖 简介 (Introduction)

LeetCode 原生编辑器对于 Java 的支持非常有限，经常需要手动输入完整的方法名，甚至容易记混 `length` 和 `length()`。

**通过 hook LeetCode 底层的 Monaco Editor，实现了**上下文感知的自动补全**。当你输入 `.` 时，脚本会根据变量类型（String, List, Map 等）自动推荐相应的方法，并支持参数跳转。


## 🚀 安装 (Installation)

1.  **安装管理器**：首先安装 [Tampermonkey (油猴)](https://www.tampermonkey.net/) 浏览器扩展。
2.  **安装脚本**：
    * 新建脚本->把js源码复制进去 [👉 点此查看源码 (GitHub)](./leetcode-userscript/blob/main/leetcode-helper.user.js)

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

## 原理 (How it works)

利用 `unsafeWindow` 穿透浏览器沙箱，获取 LeetCode 页面中的 `monaco` 编辑器实例。通过注册 `CompletionItemProvider`，并结合正则表达式对当前编辑器的代码进行轻量级扫描，从而实现对变量类型的推断。


## 📄 许可证 (License)

MIT License
