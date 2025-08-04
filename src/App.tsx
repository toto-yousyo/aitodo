import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Check,
  X,
  MessageSquare,
  List,
  Send,
  Bot,
  User,
  Trash2,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";

const TodoOpenAIApp = () => {
  // TODO機能の状態管理
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // チャット機能の状態管理
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "こんにちは！TODOの管理やタスクについて何でもお聞きください。\n\n🤖 **新機能**: 「○○のタスクを追加して」と言うだけで、自動的にTODOリストに追加できます！\n\n例：\n・「明日のプレゼン準備のタスクを追加して」\n・「買い物リストを作って」\n・「週末の予定を整理したい」",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OpenAI API設定
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // UI状態管理
  const [activeTab, setActiveTab] = useState("todo");
  const messagesEndRef = useRef(null);

  // localStorage からAPIキーを読み込み（開発用）
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // localStorageからTODOを読み込み
  useEffect(() => {
    try {
      const savedTodos = JSON.parse(
        localStorage.getItem("todos-openai") || "[]",
      );
      if (savedTodos.length > 0) {
        setTodos(savedTodos);
      } else {
        const initialTodos = [
          { id: 1, text: "OpenAI APIの設定を完了", completed: false },
          { id: 2, text: "AIタスク追加機能をテスト", completed: false },
        ];
        setTodos(initialTodos);
        localStorage.setItem("todos-openai", JSON.stringify(initialTodos));
      }
    } catch (error) {
      console.error("TODOの読み込みに失敗しました:", error);
      setTodos([]);
    }
  }, []);

  // TODOが変更されるたびにlocalStorageに保存
  useEffect(() => {
    if (todos.length > 0) {
      try {
        localStorage.setItem("todos-openai", JSON.stringify(todos));
      } catch (error) {
        console.error("TODOの保存に失敗しました:", error);
      }
    }
  }, [todos]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TODO機能
  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        addedByAI: false,
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date().toISOString() : null,
            }
          : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearAllTodos = () => {
    if (
      window.confirm("全てのTODOを削除しますか？この操作は取り消せません。")
    ) {
      setTodos([]);
      localStorage.removeItem("todos-openai");
    }
  };

  const exportTodos = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `todos-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // API設定保存
  const saveApiKey = () => {
    localStorage.setItem("openai-api-key", apiKey);
    setShowSettings(false);
    alert("APIキーを保存しました！");
  };

  // OpenAI API チャット機能
  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    if (!apiKey.trim()) {
      alert("OpenAI APIキーを設定してください！");
      setShowSettings(true);
      return;
    }

    const userMessage = newMessage.trim();
    setNewMessage("");

    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 現在のTODOリストの状況をAIに提供
      const todoContext = `
あなたはTODO管理アシスタントです。ユーザーがタスクの追加を依頼した場合、以下のJSON形式で応答してください：

{
  "action": "add_task",
  "tasks": ["タスク1", "タスク2", ...],
  "response": "ユーザーへの返答メッセージ"
}

現在のTODOリスト状況:
- 総タスク数: ${todos.length}個
- 完了済み: ${todos.filter((t) => t.completed).length}個
- 未完了: ${todos.filter((t) => !t.completed).length}個

現在のタスク一覧:
${todos.map((todo) => `- ${todo.completed ? "✅" : "⭕"} ${todo.text}`).join("\n")}

タスク追加の依頼でない場合は、通常の会話として応答してください。
`;

      // OpenAI API に送信
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: todoContext },
              ...updatedMessages.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API Error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
        );
      }

      const data = await response.json();
      let assistantResponse = data.choices[0].message.content;

      // JSONレスポンスかどうかチェック
      try {
        if (
          assistantResponse.includes('"action"') &&
          assistantResponse.includes('"add_task"')
        ) {
          const jsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const taskData = JSON.parse(jsonMatch[0]);

            if (
              taskData.action === "add_task" &&
              taskData.tasks &&
              Array.isArray(taskData.tasks)
            ) {
              // タスクを追加
              const newTasks = taskData.tasks.map((taskText) => ({
                id: Date.now() + Math.random(),
                text: taskText.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                addedByAI: true,
              }));

              setTodos((prevTodos) => [...prevTodos, ...newTasks]);
              assistantResponse =
                taskData.response ||
                `${newTasks.length}個のタスクをTODOリストに追加しました！`;
            }
          }
        }
      } catch (parseError) {
        console.log("通常の会話として処理:", parseError);
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: assistantResponse,
        },
      ]);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      let errorMessage = "申し訳ありません。エラーが発生しました。";

      if (error.message.includes("401")) {
        errorMessage = "APIキーが無効です。設定を確認してください。";
      } else if (error.message.includes("429")) {
        errorMessage =
          "APIの利用制限に達しました。少し待ってから再試行してください。";
      } else if (error.message.includes("quota")) {
        errorMessage =
          "APIクォータを超過しました。OpenAIアカウントの使用量を確認してください。";
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();
      action();
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto max-w-4xl p-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              📝 Smart TODO & OpenAI Assistant
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              title="API設定"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* API設定パネル */}
          {showSettings && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                🔑 OpenAI API設定
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={saveApiKey}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  保存
                </button>
              </div>
              <p className="text-xs text-yellow-700">
                💡{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenAI Platform
                </a>{" "}
                でAPIキーを取得してください
              </p>
            </div>
          )}

          {/* タブ切り替え */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("todo")}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === "todo"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              TODO ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
                activeTab === "chat"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              OpenAI Chat
            </button>
          </div>
        </div>

        {/* TODO セクション */}
        {activeTab === "todo" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* 進捗表示 */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-800">
                  進捗状況
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">
                    {completedCount}/{totalCount}
                  </span>
                  <button
                    onClick={exportTodos}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="TODOをエクスポート"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAllTodos}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="全て削除"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width:
                      totalCount > 0
                        ? `${(completedCount / totalCount) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-green-600">
                💾 データは自動的にブラウザに保存されます
              </div>
            </div>

            {/* TODO追加フォーム */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTodo)}
                placeholder="新しいタスクを入力..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* TODO リスト */}
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    todo.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  } ${todo.addedByAI ? "border-l-4 border-l-green-400" : ""}`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "text-green-700 line-through"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.text}
                    {todo.addedByAI && (
                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        🤖 AI追加
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {todos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-2">📝</div>
                  <div>まだタスクがありません</div>
                  <div className="text-sm">
                    上でタスクを追加するか、AIチャットでタスク追加を依頼してください
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* チャットセクション */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* ステータス表示 */}
            <div className="p-3 bg-green-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${apiKey ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-sm font-medium">
                    {apiKey ? "OpenAI API 接続済み" : "APIキーが未設定"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">GPT-3.5 Turbo</span>
              </div>
            </div>

            {/* チャットメッセージ表示エリア */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === "user" ? (
                        <User className="w-4 h-4 mr-1" />
                      ) : (
                        <Bot className="w-4 h-4 mr-1" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.role === "user" ? "あなた" : "OpenAI"}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center">
                      <Bot className="w-4 h-4 mr-1" />
                      <span className="text-xs opacity-75 mr-2">OpenAI</span>
                      <div className="animate-pulse">考え中...</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* メッセージ入力エリア */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, sendMessage)}
                  placeholder="OpenAIにタスクの追加依頼や質問をしてみましょう... 例：「明日のプレゼン準備のタスクを追加して」"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="2"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !newMessage.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shift + Enter で改行、Enter で送信 | OpenAI GPT-3.5 Turbo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoOpenAIApp;
