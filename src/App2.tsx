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
        addedByAI: fales,
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo("");
    }
  };
};
