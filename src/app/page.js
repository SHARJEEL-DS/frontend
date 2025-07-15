"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import {
  AiOutlinePlus,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
} from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Fragment } from "react";

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchTasks = async () => {
    try {
      const res = await axios.get("https://bankenddd.onrender.com/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        await axios.put(
          `https://bankenddd.onrender.com/api/tasks/${editingTask._id}`,
          data
        );
        toast.success("Task updated");
      } else {
        await axios.post("https://bankenddd.onrender.com/api/tasks", data);
        toast.success("Task created");
      }
      reset();
      setOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error("Submit failed");
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    reset(task);
    setOpen(true);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">📝 My Tasks</h1>
          <button
            onClick={() => {
              setEditingTask(null);
              reset();
              setOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            <AiOutlinePlus className="text-xl" /> Add Task
          </button>
        </div>

        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{task.title}</h2>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="cursor-pointer hover:scale-105 transition"
                    onClick={async () => {
                      try {
                        const newStatus =
                          task.status === "completed" ? "pending" : "completed";
                        await axios.put(
                          `https://bankenddd.onrender.com/api/tasks/${task._id}`,
                          { status: newStatus }
                        );
                        toast.success(`Marked as ${newStatus}`);
                        fetchTasks();
                      } catch (err) {
                        toast.error("Failed to update status");
                      }
                    }}
                  >
                    {task.status === "completed" ? (
                      <AiOutlineCheckCircle className="text-green-500 text-2xl" />
                    ) : (
                      <AiOutlineClockCircle className="text-yellow-500 text-2xl" />
                    )}
                  </div>
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await axios.delete(
                          `https://bankenddd.onrender.com/api/tasks/${task._id}`
                        );
                        toast.success("Task deleted");
                        fetchTasks();
                      } catch (err) {
                        toast.error("Failed to delete task");
                      }
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Modal */}
        <Transition appear show={open} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-30" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-lg font-bold mb-4">
                      {editingTask ? "Edit Task" : "Add Task"}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="block mb-1 font-medium">Title</label>
                        <input
                          {...register("title", { required: "Title is required" })}
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Description</label>
                        <textarea
                          {...register("description")}
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Status</label>
                        <select
                          {...register("status")}
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            setEditingTask(null);
                            reset();
                          }}
                          className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {editingTask ? "Update" : "Create"}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default HomePage;
