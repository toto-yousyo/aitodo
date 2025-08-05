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
      const newTodoitem = {
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

  // AI改善提案のモック昨日
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
};
