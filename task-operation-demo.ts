class TaskOperationError extends Error {
  public readonly code: string;

  /** Creates an error with a machine-readable operation code. */
  constructor(code: string, message: string) {
    super(message);
    this.name = "TaskOperationError";
    this.code = code;
  }
}

interface RecursiveTaskNode {
  id: string;
  title: string;
  done: boolean;
  subtasks: RecursiveTaskNode[];
}

class SprintNoteManager {
  private tasks: RecursiveTaskNode[] = [];

  /** Creates a manager for a named task group. */
  constructor(public readonly groupName: string) {}

  /** Adds a task after validating that it has a useful title. */
  public addTask(node: RecursiveTaskNode): void {
    if (!node.title || node.title.trim().length < 2) {
      throw new TaskOperationError(
        "INVALID_TITLE",
        `Task "${node.id}" must have a descriptive title.`,
      );
    }

    this.tasks.push(node);
  }

  /** Returns a copy of the top-level task list. */
  public getTaskList(): RecursiveTaskNode[] {
    return [...this.tasks];
  }

  /** Counts a task and all of its nested subtasks recursively. */
  public countTotalNodesRecursive(
    nodes: RecursiveTaskNode[] = this.tasks,
  ): number {
    let count = 0;

    for (const node of nodes) {
      count += 1;

      if (node.subtasks.length > 0) {
        count += this.countTotalNodesRecursive(node.subtasks);
      }
    }

    return count;
  }

  /** Simulates asynchronously syncing the task tree to a remote board. */
  public async syncToRemoteBoard(): Promise<{
    syncedCount: number;
    timestamp: string;
  }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.tasks.length === 0) {
          reject(
            new TaskOperationError(
              "EMPTY_BOARD",
              "Cannot sync an empty task list.",
            ),
          );
          return;
        }

        resolve({
          syncedCount: this.countTotalNodesRecursive(),
          timestamp: new Date().toISOString(),
        });
      }, 400);
    });
  }
}

/** Runs the TypeScript demonstration and handles expected errors. */
async function runTaskOperationDemo(): Promise<void> {
  console.log("=== Mart Task Operation Demo ===\n");

  const taskManager = new SprintNoteManager("Internship Tasks");

  try {
    taskManager.addTask({
      id: "T-1",
      title: "Build Kanban Board UI",
      done: true,
      subtasks: [
        {
          id: "T-1.1",
          title: "Configure Tailwind Pastel Tokens",
          done: true,
          subtasks: [
            {
              id: "T-1.1.1",
              title: "Verify Imperial Blue contrast",
              done: true,
              subtasks: [],
            },
          ],
        },
        {
          id: "T-1.2",
          title: "Add Framer Motion layout transitions",
          done: false,
          subtasks: [],
        },
      ],
    });

    taskManager.addTask({
      id: "T-2",
      title: "Write Unit Tests",
      done: false,
      subtasks: [],
    });

    console.log(`Group: ${taskManager.groupName}`);
    console.log(`Top-level task count: ${taskManager.getTaskList().length}`);
    console.log(
      `Total recursive task nodes: ${taskManager.countTotalNodesRecursive()}`,
    );
    console.log("\nSyncing tasks asynchronously...");

    const syncResult = await taskManager.syncToRemoteBoard();

    console.log(
      `Sync complete -> Items: ${syncResult.syncedCount} at ${syncResult.timestamp}\n`,
    );
    console.log("Testing exception handling with invalid task input...");

    taskManager.addTask({
      id: "T-ERR",
      title: " ",
      done: false,
      subtasks: [],
    });
  } catch (error: unknown) {
    if (error instanceof TaskOperationError) {
      console.error(
        `[Handled ${error.name} - ${error.code}]: ${error.message}`,
      );
    } else {
      console.error("[Unexpected Error]:", error);
    }
  }
}

runTaskOperationDemo();
