import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Bot, Lightbulb } from "lucide-react";

const SimpleTodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // localStorage対応
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem("simple-todos") || "[]");
    setTodos(savedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem("simple-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        addedByAI: false,
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // AI改善提案のモック機能
  const generateImprovements = () => {
    const improvements = [
      "タスクの優先度設定機能を追加",
      "期限日の設定とリマインダー機能",
      "タスクのカテゴリ分け機能",
      "ダークモード対応",
      "タスクの検索・フィルター機能",
      "完了統計とレポート機能",
      "タスクの並び替え（ドラッグ&ドロップ）",
      "サブタスク機能の追加",
      "タスクテンプレート機能",
      "データのクラウド同期機能",
    ];

    const selectedImprovements = improvements
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((text) => ({
        id: Date.now() + Math.random(),
        text: text,
        completed: false,
        addedByAI: true,
      }));

    setTodos((prev) => [...prev, ...selectedImprovements]);
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            📝 Smart TODO App（テスト版）
          </h1>

          {/* 進捗表示 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">
                進捗状況
              </span>
              <span className="text-sm text-blue-600">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width:
                    totalCount > 0
                      ? `${(completedCount / totalCount) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>

          {/* タスク追加 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTodo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* AI改善提案ボタン */}
          <div className="mb-6 text-center">
            <button
              onClick={generateImprovements}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span>🤖 AI改善提案を生成</span>
                <Lightbulb className="w-5 h-5" />
              </div>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              アプリ改善のためのタスクをAIが自動生成します
            </p>
          </div>

          {/* TODOリスト */}
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  todo.completed
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                } ${todo.addedByAI ? "border-l-4 border-l-purple-400" : ""}`}
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
                    <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      🤖 AI提案
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
                  上でタスクを追加するか、AI改善提案をお試しください
                </div>
              </div>
            )}
          </div>

          {/* 説明 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">
              💡 このテスト版について
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • 「🤖 AI改善提案を生成」ボタンでアプリ改善タスクを自動生成
              </li>
              <li>
                • 実際のAI APIの代わりに事前定義された改善案をランダム表示
              </li>
              <li>• localStorage対応でデータは保存されます</li>
              <li>• 紫のボーダーがAI生成タスクの印です</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTodoApp;
