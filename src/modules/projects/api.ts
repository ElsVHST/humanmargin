import type { Project, Task, TaskStatus } from "@/payload-types";

async function req<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const tekst = await res.text().catch(() => "");
    throw new Error(`${method} ${url} → ${res.status}: ${tekst.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Dunne, getypeerde REST-laag voor de projecten-views. */
export const projectsApi = {
  updateTask: (id: Task["id"], data: Partial<Task>) =>
    req<{ doc: Task }>(`/api/tasks/${id}`, "PATCH", data),
  createProject: (data: Partial<Project> & { naam: string }) =>
    req<{ doc: Project }>(`/api/projects`, "POST", data),
  updateProject: (id: Project["id"] | string, data: Partial<Project>) =>
    req<{ doc: Project }>(`/api/projects/${id}`, "PATCH", data),
  createStatus: (data: Pick<TaskStatus, "naam" | "kleur">) =>
    req<{ doc: TaskStatus }>(`/api/task-statuses`, "POST", data),
  updateStatus: (id: TaskStatus["id"], data: Partial<TaskStatus>) =>
    req<{ doc: TaskStatus }>(`/api/task-statuses/${id}`, "PATCH", data),
  trashStatus: (id: TaskStatus["id"]) =>
    req<{ doc: TaskStatus }>(`/api/task-statuses/${id}`, "PATCH", {
      deletedAt: new Date().toISOString(),
    }),
};
