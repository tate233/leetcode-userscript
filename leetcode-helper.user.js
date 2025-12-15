// ==UserScript==
// @name         leetcode-userscript
// @namespace    https://github.com/tate233/leetcode-userscript
// @version      1.0.0
// @description  LeetCode 刷题助手：为 Java 提供自动补全功能 (String, List, Map 等 contextual completion)
// @author       tate
// @match        https://leetcode.com/problems/*
// @match        https://leetcode.cn/problems/*
// @license      MIT
// @supportURL   https://github.com/tate233/leetcode-userscript/issues
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. 结构化的 API 数据库 ---
    const API_DB = {
        'String': [
            { label: 'length()', insertText: 'length()', detail: 'int length()', doc: 'String 长度', kind: 'Method' },
            { label: 'charAt()', insertText: 'charAt(${1:0})', detail: 'char charAt(i)', doc: '取字符', kind: 'Method' },
            { label: 'substring()', insertText: 'substring(${1:start}, ${2:end})', detail: 'String sub...', doc: '截取子串', kind: 'Method' },
            { label: 'equals()', insertText: 'equals(${1:obj})', detail: 'boolean equals', doc: '比较内容', kind: 'Method' },
            { label: 'toCharArray()', insertText: 'toCharArray()', detail: 'char[]', doc: '转字符数组', kind: 'Method' },
            { label: 'trim()', insertText: 'trim()', detail: 'String', doc: '去空格', kind: 'Method' },
            { label: 'indexOf()', insertText: 'indexOf(${1:str})', detail: 'int', doc: '查找位置', kind: 'Method' },
            { label: 'split()', insertText: 'split("${1:regex}")', detail: 'String[]', doc: '分割字符串', kind: 'Method' }
        ],
        'List': [
            { label: 'size()', insertText: 'size()', detail: 'int', doc: '元素数量', kind: 'Method' },
            { label: 'add()', insertText: 'add(${1:val})', detail: 'bool add(E)', doc: '添加', kind: 'Method' },
            { label: 'get()', insertText: 'get(${1:idx})', detail: 'E get(int)', doc: '获取', kind: 'Method' },
            { label: 'remove()', insertText: 'remove(${1:idx})', detail: 'E remove', doc: '删除', kind: 'Method' },
            { label: 'contains()', insertText: 'contains(${1:obj})', detail: 'bool', doc: '包含? (O(N))', kind: 'Method' },
            { label: 'isEmpty()', insertText: 'isEmpty()', detail: 'bool', doc: '是否为空', kind: 'Method' },
            { label: 'toArray()', insertText: 'toArray()', detail: 'Object[]', doc: '转数组', kind: 'Method' }
        ],
        'Map': [
            { label: 'put()', insertText: 'put(${1:key}, ${2:val})', detail: 'put(K,V)', doc: '插入', kind: 'Method' },
            { label: 'get()', insertText: 'get(${1:key})', detail: 'get(K)', doc: '读取', kind: 'Method' },
            { label: 'getOrDefault()', insertText: 'getOrDefault(${1:key}, ${2:def})', detail: 'getOrDefault', doc: '安全读取', kind: 'Method' },
            { label: 'containsKey()', insertText: 'containsKey(${1:key})', detail: 'bool', doc: '包含键?', kind: 'Method' },
            { label: 'keySet()', insertText: 'keySet()', detail: 'Set<K>', doc: '键集合', kind: 'Method' },
            { label: 'values()', insertText: 'values()', detail: 'Collection<V>', doc: '值集合', kind: 'Method' },
            { label: 'entrySet()', insertText: 'entrySet()', detail: 'Set<Entry>', doc: '键值对', kind: 'Method' },
            { label: 'computeIfAbsent()', insertText: 'computeIfAbsent(${1:key}, k -> new ArrayList<>())', detail: 'compute...', doc: '建图神器', kind: 'Snippet' }
        ],
        'Queue': [
            { label: 'offer()', insertText: 'offer(${1:val})', detail: 'bool offer', doc: '入队', kind: 'Method' },
            { label: 'poll()', insertText: 'poll()', detail: 'E poll', doc: '出队', kind: 'Method' },
            { label: 'peek()', insertText: 'peek()', detail: 'E peek', doc: '看队头', kind: 'Method' },
            { label: 'isEmpty()', insertText: 'isEmpty()', detail: 'bool', doc: '为空?', kind: 'Method' }
        ],
        'Stack': [
            { label: 'push()', insertText: 'push(${1:val})', detail: 'push(E)', doc: '入栈', kind: 'Method' },
            { label: 'pop()', insertText: 'pop()', detail: 'E pop', doc: '出栈', kind: 'Method' },
            { label: 'peek()', insertText: 'peek()', detail: 'E peek', doc: '看栈顶', kind: 'Method' }
        ],
        'Array': [
            { label: 'length', insertText: 'length', detail: 'int (Property)', doc: '数组长度', kind: 'Property' },
            { label: 'clone()', insertText: 'clone()', detail: 'T[]', doc: '克隆', kind: 'Method' }
        ]
    };

    const TYPE_ALIAS = {
        'ArrayList': 'List', 'LinkedList': 'Queue', 'HashMap': 'Map', 
        'HashSet': 'Set', 'StringBuilder': 'String', 'Deque': 'Queue'
    };

    // --- 2. 核心逻辑：推断变量类型 ---
    function inferType(code, variableName) {
        if (!variableName) return null;
        // 查找 "Type variableName" 定义
        const declarationRegex = new RegExp(`\\b([A-Z][a-zA-Z0-9_]*)(?:<.*?>)?(\\s*\\[\\])?\\s+${variableName}\\b`);
        const match = code.match(declarationRegex);
        if (match) {
            let type = match[1];
            if (match[2]) return 'Array'; // 数组
            if (TYPE_ALIAS[type]) return TYPE_ALIAS[type];
            return type;
        }
        // 查找 "int[] variableName" 定义
        const primitiveArrayRegex = new RegExp(`\\b(int|char|long|boolean|double|float|byte|short)\\s*\\[\\s*\\]\\s+${variableName}\\b`);
        if (primitiveArrayRegex.test(code)) return 'Array';
        return null;
    }

    // --- 3. Monaco 注入逻辑 ---
    function waitForMonaco() {
        const monaco = unsafeWindow.monaco;
        if (monaco && monaco.languages && monaco.editor) {
            console.log('LeetCode Smart Assistant: V3.1 修复版已加载');
            registerSmartProvider(monaco);
        } else {
            setTimeout(waitForMonaco, 1000);
        }
    }

    function registerSmartProvider(monaco) {
        monaco.languages.registerCompletionItemProvider('java', {
            // 关键：确保点号触发
            triggerCharacters: ['.'],
            
            provideCompletionItems: function(model, position) {
                const lineContent = model.getLineContent(position.lineNumber);
                // 获取光标前的内容
                const textBeforeCursor = lineContent.substring(0, position.column - 1); // 注意这里是 -1，不包含当前还没输完的字符

                // --- 修复重点 ---
                // 现在的正则逻辑：寻找 "变量名" + "可能的空格" + "点号" + "可能的后续字符"
                // 例子1: "list." -> 匹配出 group[1] = "list"
                // 例子2: "list.a" -> 匹配出 group[1] = "list"
                const match = textBeforeCursor.match(/([a-zA-Z0-9_]+)\s*\.\s*([a-zA-Z0-9_]*)$/);
                
                let suggestions = [];
                
                // 默认兜底：如果正则没匹配到 (比如在空行按点)，为了防止完全没反应，可以选择不返回或返回基础建议。
                // 但如果是 "list."，match 肯定不为空。
                if (match) {
                    const variableName = match[1]; // 拿到点号前面的变量名
                    const fullCode = model.getValue();
                    const detectedType = inferType(fullCode, variableName);
                    
                    console.log(`触发补全 -> 变量: ${variableName}, 类型: ${detectedType}`);

                    if (detectedType && API_DB[detectedType]) {
                        suggestions = API_DB[detectedType];
                    } else {
                        // 没识别出类型，把常用的大集合都给他 (List, Map, String)
                        // 这样至少比“没反应”要好
                        suggestions = [
                            ...API_DB['String'], ...API_DB['List'], ...API_DB['Map'], ...API_DB['Array']
                        ];
                    }
                } else {
                    // 没匹配到变量名（比如直接输入 . ），这里啥也不干或者返回空
                    return { suggestions: [] }; 
                }

                // 计算替换范围 (用于覆盖 . 后面的字符，比如 list.a -> 替换 a)
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                return {
                    suggestions: suggestions.map(item => ({
                        label: item.label,
                        kind: item.kind === 'Snippet' ? monaco.languages.CompletionItemKind.Snippet : 
                              (item.kind === 'Property' ? monaco.languages.CompletionItemKind.Property : monaco.languages.CompletionItemKind.Method),
                        detail: item.detail,
                        documentation: item.doc,
                        insertText: item.insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                    }))
                };
            }
        });
    }

    waitForMonaco();
})();
