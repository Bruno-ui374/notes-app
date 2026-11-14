import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  BellRing,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCheck,
  ChevronDown,
  CirclePlus,
  Inbox,
  LayoutGrid,
  List,
  Maximize2,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Search,
  Sparkles,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useTaskBoard } from "../../controllers/useTaskBoard";
import { Task, TaskGroup, TaskStatus } from "../../models/task";

type View = "board" | "calendar" | "insights";
type Theme = "light" | "dark";
const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  progress: "In progress",
  done: "Done",
};
const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
const currentDate = new Date();
const todayKey = currentDate.toISOString().slice(0, 10);
const currentDateLabel = currentDate.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const kaizenQuotes = [
  ["Small steps, every day, add up to big change.", "— Kaizen wisdom"],
  [
    "Improve by one percent today. Then do it again tomorrow.",
    "— The Kaizen mindset",
  ],
  [
    "Consistency is the quiet engine behind meaningful progress.",
    "— Mart’s workspace",
  ],
];
const daysUntil = (date: string) =>
  Math.round(
    (Date.parse(`${date}T12:00:00`) - Date.parse(`${todayKey}T12:00:00`)) /
      86400000,
  );
const deadlineCopy = (days: number) =>
  days < 0
    ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`
    : days === 0
      ? "Due today"
      : days === 1
        ? "Due tomorrow"
        : `Due in ${days} days`;

function App() {
  const {
    tasks,
    groupStats,
    updateTaskStatus,
    addTask,
    updateTask,
    addGroup,
    updateGroup,
    moveGroup,
  } = useTaskBoard();
  const [view, setView] = useState<View>("board");
  const [theme, setTheme] = useState<Theme>("light");
  const [showForm, setShowForm] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [kaizenQuoteIndex, setKaizenQuoteIndex] = useState(() =>
    Math.floor(Math.random() * kaizenQuotes.length),
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  useEffect(() => {
    const viewTitles: Record<View, string> = {
      board: "My Board",
      calendar: "Calendar",
      insights: "Insights",
    };

    document.title = `${viewTitles[view]} | Mart Task Planner`;
  }, [view]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setKaizenQuoteIndex((current) => {
        let next = Math.floor(Math.random() * kaizenQuotes.length);
        if (kaizenQuotes.length > 1 && next === current) {
          next = (current + 1) % kaizenQuotes.length;
        }
        return next;
      });
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const openView = (nextView: View) => {
    setView(nextView);
    setMenuOpen(false);
  };
  const filteredGroups = groupStats.map((group) => ({
    ...group,
    tasks: group.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) &&
        (filter === "all" || task.status === filter),
    ),
  }));
  const deadlineAlerts = useMemo(
    () =>
      tasks
        .filter(
          (task) => task.status !== "done" && daysUntil(task.dueDate) <= 7,
        )
        .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)),
    [tasks],
  );
  const unread = deadlineAlerts.length > 0 && !notificationsSeen;

  return (
    <main
      className={`app-shell theme-${theme} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <aside className="sidebar">
        <button
          className="sidebar-collapse"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
        <button
          className="sidebar-brand"
          onClick={() => openView("board")}
          aria-label="Go to board"
        >
          <span className="sidebar-mark">
            <Sparkles size={14} />
          </span>
          <span>mart</span>
        </button>
        <button
          className="sidebar-add"
          onClick={() => setShowGroupForm(true)}
          title="New group"
        >
          <CirclePlus size={15} />
          <span>New group</span>
        </button>
        <div className="sidebar-swatches">
          <span className="swatch swatch-blue" />
          <span className="swatch swatch-pink" />
          <span className="swatch swatch-yellow" />
          <span className="swatch swatch-teal" />
        </div>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <button
            className={view === "board" ? "active" : ""}
            onClick={() => openView("board")}
            title="Board"
          >
            <LayoutGrid size={15} />
            <span>Board</span>
          </button>
          <button
            className={view === "calendar" ? "active" : ""}
            onClick={() => openView("calendar")}
            title="Calendar"
          >
            <CalendarRange size={15} />
            <span>Calendar</span>
          </button>
          <button
            className={view === "insights" ? "active" : ""}
            onClick={() => openView("insights")}
            title="Insights"
          >
            <BarChart3 size={15} />
            <span>Insights</span>
          </button>
          <button title="Archive">
            <Inbox size={15} />
            <span>Archive</span>
          </button>
          <button title="Trash">
            <Trash2 size={15} />
            <span>Trash</span>
          </button>
        </nav>
        <div className="sidebar-note" aria-live="polite">
          <span>Kaizen note</span>
          <p>{kaizenQuotes[kaizenQuoteIndex][0]}</p>
          <small>{kaizenQuotes[kaizenQuoteIndex][1]}</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="brand"
            onClick={() => openView("board")}
            aria-label="Go to board"
          >
            <span className="brand-mark">
              <Sparkles size={16} />
            </span>
            <span>Mart task planner</span>
          </button>
          <nav className="top-nav">
            <button
              className={view === "board" ? "active" : ""}
              onClick={() => openView("board")}
            >
              My board
            </button>
            <button
              className={view === "calendar" ? "active" : ""}
              onClick={() => openView("calendar")}
            >
              Calendar
            </button>
            <button
              className={view === "insights" ? "active" : ""}
              onClick={() => openView("insights")}
            >
              Insights
            </button>
          </nav>
          <div className="header-actions">
            <div className="notification-wrap">
              <button
                className={`icon-btn notification ${unread ? "has-unread" : ""}`}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setNotificationsSeen(true);
                }}
                aria-label={`Notifications${unread ? `, ${deadlineAlerts.length} unread` : ""}`}
              >
                <Bell size={18} />
                <span className="notification-count">
                  {deadlineAlerts.length || ""}
                </span>
              </button>
              {notificationsOpen && (
                <NotificationPanel
                  tasks={deadlineAlerts}
                  onStatusChange={updateTaskStatus}
                  onClose={() => setNotificationsOpen(false)}
                />
              )}
            </div>
            <button
              className="theme-toggle icon-btn"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              className="menu-toggle icon-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" /> {currentDateLabel}
            </p>
            <h1>
              {view === "board" ? (
                <>
                  Make space for
                  <br />
                  <em>good work.</em>
                </>
              ) : view === "calendar" ? (
                <>
                  See your week
                  <br />
                  <em>at a glance.</em>
                </>
              ) : (
                <>
                  Small steps,
                  <br />
                  <em>big momentum.</em>
                </>
              )}
            </h1>
            <p className="hero-copy">
              {view === "board"
                ? "A clear view of everything you’re moving forward."
                : view === "calendar"
                  ? "Your deadlines, arranged around the work that matters."
                  : "A little context for the progress you’re making."}
            </p>
          </div>
          <div className="hero-quote">
            <span>“</span>
            <p>
              {kaizenQuotes[currentDate.getDate() % kaizenQuotes.length][0]}
            </p>
            <small>
              {kaizenQuotes[currentDate.getDate() % kaizenQuotes.length][1]}
            </small>
          </div>
        </section>

        {view === "board" && (
          <BoardView
            groups={filteredGroups}
            groupStats={groupStats}
            sidebarCollapsed={sidebarCollapsed}
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            onAdd={(groupId) => setShowForm(groupId)}
            onAddGroup={() => setShowGroupForm(true)}
            onStatusChange={updateTaskStatus}
            onEditTask={setEditingTask}
            onEditGroup={setEditingGroup}
            moveGroup={moveGroup}
          />
        )}
        {view === "calendar" && (
          <CalendarView tasks={tasks} onStatusChange={updateTaskStatus} />
        )}
        {view === "insights" && (
          <InsightsView
            tasks={tasks}
            groups={groupStats}
            onGoToBoard={() => openView("board")}
          />
        )}

        <footer>
          <span>
            <span className="footer-dot" /> All changes saved
          </span>
          <span>Mart task planner · {currentDate.getFullYear()}</span>
        </footer>
        <Fragment>
          {showForm && (
            <TaskForm
              groups={groupStats}
              defaultGroupId={showForm}
              onClose={() => setShowForm(null)}
              onAdd={(...args) => {
                addTask(...args);
                setShowForm(null);
              }}
            />
          )}
        </Fragment>
        <Fragment>
          {editingTask && (
            <TaskForm
              task={editingTask}
              groups={groupStats}
              defaultGroupId={editingTask.groupId}
              onClose={() => setEditingTask(null)}
              onUpdate={(id, ...args) => {
                updateTask(id, ...args);
                setEditingTask(null);
              }}
            />
          )}
        </Fragment>
        <Fragment>
          {showGroupForm && (
            <GroupForm
              onClose={() => setShowGroupForm(false)}
              onAdd={(...args) => {
                addGroup(...args);
                setShowGroupForm(false);
              }}
            />
          )}
        </Fragment>
        <Fragment>
          {editingGroup && (
            <GroupForm
              group={groupStats.find((item) => item.id === editingGroup)}
              onClose={() => setEditingGroup(null)}
              onUpdate={(id, ...args) => {
                updateGroup(id, ...args);
                setEditingGroup(null);
              }}
            />
          )}
        </Fragment>
        {menuOpen && (
          <div className="mobile-menu">
            <button onClick={() => openView("board")}>My board</button>
            <button onClick={() => openView("calendar")}>Calendar</button>
            <button onClick={() => openView("insights")}>Insights</button>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "Dark theme" : "Light theme"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function BoardView({
  groups,
  groupStats,
  sidebarCollapsed,
  query,
  setQuery,
  filter,
  setFilter,
  onAdd,
  onAddGroup,
  onStatusChange,
  onEditTask,
  onEditGroup,
  moveGroup,
}: {
  groups: ReturnType<typeof useTaskBoard>["groupStats"];
  groupStats: ReturnType<typeof useTaskBoard>["groupStats"];
  sidebarCollapsed: boolean;
  query: string;
  setQuery: (value: string) => void;
  filter: "all" | TaskStatus;
  setFilter: (value: "all" | TaskStatus) => void;
  onAdd: (groupId: string) => void;
  onAddGroup: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onEditGroup: (id: string) => void;
  moveGroup: (id: string, direction: -1 | 1) => void;
}) {
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [boardExpanded, setBoardExpanded] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping || !window.matchMedia("(min-width: 761px)").matches) {
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setBoardExpanded((expanded) => !expanded);
      } else if (event.key === "Escape") {
        setBoardExpanded(false);
      }
    };

    document.addEventListener("keydown", handleShortcut);

    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = boardExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [boardExpanded]);

  return (
    <>
      <section className="toolbar" id="board">
        <div className="view-tabs">
          <button
            className={layout === "list" ? "selected" : ""}
            onClick={() => setLayout("list")}
          >
            <List size={16} />
            List
          </button>
          <button
            className={layout === "grid" ? "selected" : ""}
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid size={16} />
            Grid
          </button>
        </div>
        <div className="toolbar-actions">
          <label className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks..."
            />
          </label>
          <select
            className="filter-select"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as "all" | TaskStatus)
            }
            aria-label="Filter tasks"
          >
            <option value="all">All tasks</option>
            <option value="todo">To do</option>
            <option value="progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <button className="secondary-btn new-group-btn" onClick={onAddGroup}>
            <CirclePlus size={17} /> New group
          </button>
          <button
            className="primary-btn"
            onClick={() => groupStats[0] && onAdd(groupStats[0].id)}
            disabled={!groupStats.length}
          >
            <CirclePlus size={18} /> Add task
          </button>
          <button
            className="icon-btn board-expand-btn"
            onClick={() => setBoardExpanded((expanded) => !expanded)}
            aria-label={boardExpanded ? "Collapse task board" : "Expand task board"}
            title="Press F to expand the task board"
          >
            <Maximize2 size={17} />
          </button>
        </div>
      </section>
      <section
        className={`board board-${layout} ${boardExpanded ? "board-expanded" : ""} ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}
      >
        {boardExpanded && (
          <button
            className={`board-focus-backdrop ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}
            type="button"
            aria-label="Close expanded task board"
            onClick={() => setBoardExpanded(false)}
          />
        )}
        {groups.length ? (
          groups.map((group) => {
            const progress = group.total
              ? Math.round((group.complete / group.total) * 100)
              : 0;
            const isCompact = group.tasks.length >= 3;
            return (
              <section
                key={group.id}
                className={`group-card accent-${group.accent} ${isCompact ? "is-compact" : ""}`}
              >
                <div className="group-heading">
                  <div className="group-title-wrap">
                    <span className="group-icon">
                      {group.accent === "blue"
                        ? "✦"
                        : group.accent === "pink"
                          ? "♡"
                          : group.accent === "yellow"
                            ? "☼"
                            : group.accent === "teal"
                              ? "◈"
                              : group.accent === "purple"
                                ? "✧"
                                : "◆"}
                    </span>
                    <div>
                      <h2>{group.name}</h2>
                      <p>{group.description}</p>
                    </div>
                  </div>
                  <div className="group-tools">
                    <button
                      className="move-btn"
                      onClick={() => moveGroup(group.id, -1)}
                      aria-label={`Move ${group.name} up`}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      className="move-btn"
                      onClick={() => moveGroup(group.id, 1)}
                      aria-label={`Move ${group.name} down`}
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      className="more-btn"
                      onClick={() => onEditGroup(group.id)}
                      aria-label={`Edit ${group.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
                <div className="group-details">
                  <div className="progress-row">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span>
                      {group.complete}/{group.total} done
                    </span>
                  </div>
                  <div className="task-list">
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        compact={isCompact}
                        onStatusChange={onStatusChange}
                        onEdit={onEditTask}
                      />
                    ))}
                    {!group.tasks.length && (
                      <div className="empty-state">No matching tasks</div>
                    )}
                  </div>
                  <button
                    className="add-inline"
                    onClick={() => onAdd(group.id)}
                  >
                    <CirclePlus size={16} /> Add task to {group.name}
                  </button>
                </div>
              </section>
            );
          })
        ) : (
          <div className="board-empty">
            <Sparkles size={26} />
            <h2>Your board is ready</h2>
            <p>
              Create your first group, then add tasks to make this space yours.
            </p>
            <button className="primary-btn" onClick={onAddGroup}>
              <CirclePlus size={17} /> Create first group
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function CalendarView({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [month, setMonth] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthName = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from(
    { length: firstWeekday + daysInMonth },
    (_, index) => (index < firstWeekday ? null : index - firstWeekday + 1),
  );
  const tasksByDay = new Map<number, Task[]>();
  tasks
    .filter((task) =>
      task.dueDate.startsWith(
        `${year}-${String(monthIndex + 1).padStart(2, "0")}-`,
      ),
    )
    .forEach((task) => {
      const day = Number(task.dueDate.slice(-2));
      tasksByDay.set(day, [...(tasksByDay.get(day) ?? []), task]);
    });
  const changeMonth = (amount: number) =>
    setMonth(new Date(year, monthIndex + amount, 1));
  const isToday = (day: number) =>
    year === currentDate.getFullYear() &&
    monthIndex === currentDate.getMonth() &&
    day === currentDate.getDate();

  return (
    <section className="calendar-view">
      <div className="calendar-header">
        <div>
          <p className="eyebrow">Your planning calendar</p>
          <h2>Deadlines & milestones</h2>
        </div>
        <div className="calendar-switcher">
          <button aria-label="Previous month" onClick={() => changeMonth(-1)}>
            <ArrowLeft size={16} />
          </button>
          <strong>{monthName}</strong>
          <button aria-label="Next month" onClick={() => changeMonth(1)}>
            <ArrowRight size={16} />
          </button>
          <button
            className="today-btn"
            onClick={() =>
              setMonth(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
              )
            }
          >
            Today
          </button>
        </div>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid calendar-days">
        {cells.map((day, index) => (
          <div
            key={`${year}-${monthIndex}-${index}`}
            className={`calendar-day ${day && isToday(day) ? "today" : ""}`}
          >
            {day && (
              <>
                <span>{day}</span>
                {(tasksByDay.get(day) ?? []).map((task) => (
                  <button
                    key={task.id}
                    className={`calendar-task ${task.status}`}
                    onClick={() =>
                      onStatusChange(
                        task.id,
                        task.status === "done" ? "todo" : "done",
                      )
                    }
                    title="Click to toggle completion"
                  >
                    <i />
                    {task.title}
                  </button>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function InsightsView({
  tasks,
  groups,
  onGoToBoard,
}: {
  tasks: Task[];
  groups: ReturnType<typeof useTaskBoard>["groupStats"];
  onGoToBoard: () => void;
}) {
  const done = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.filter((task) => task.status === "progress").length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <section className="insights-view">
      <div className="insights-heading">
        <div>
          <p className="eyebrow">Workspace pulse</p>
          <h2>Your progress, in context</h2>
        </div>
        <button className="secondary-btn" onClick={onGoToBoard}>
          Open board <ArrowRight size={15} />
        </button>
      </div>
      <div className="metric-grid">
        <div className="metric-card metric-blue">
          <span>Completion rate</span>
          <strong>{completion}%</strong>
          <small>of all tasks finished</small>
          <div
            className="metric-ring"
            style={
              { "--ring-progress": `${completion * 3.6}deg` } as CSSProperties
            }
          >
            {completion}%
          </div>
        </div>
        <div className="metric-card metric-pink">
          <span>In motion</span>
          <strong>{progress}</strong>
          <small>tasks currently active</small>
          <BarChart3 size={48} />
        </div>
        <div className="metric-card metric-yellow">
          <span>Finished</span>
          <strong>{done}</strong>
          <small>tasks crossed off</small>
          <CheckCheck size={48} />
        </div>
      </div>
      <div className="breakdown-card">
        <div className="breakdown-header">
          <h3>Progress by group</h3>
          <span>{tasks.length} total tasks</span>
        </div>
        {groups.map((group) => {
          const value = group.total
            ? Math.round((group.complete / group.total) * 100)
            : 0;
          return (
            <div className="breakdown-row" key={group.id}>
              <div>
                <span className={`mini-dot ${group.accent}`} />
                {group.name}
              </div>
              <div className="breakdown-bar">
                <i
                  className={`fill-${group.accent}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <b>{value}%</b>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NotificationPanel({
  tasks,
  onStatusChange,
  onClose,
}: {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onClose: () => void;
}) {
  return (
    <div className="notification-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Deadline alerts</span>
          <h3>What needs attention</h3>
        </div>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close notifications"
        >
          <X size={17} />
        </button>
      </div>
      {tasks.length ? (
        tasks.map((task) => {
          const days = daysUntil(task.dueDate);
          return (
            <div className="notification-item" key={task.id}>
              <span
                className={`notification-icon ${days <= 0 ? "urgent" : "pink"}`}
              >
                {days <= 0 ? (
                  <BellRing size={15} />
                ) : (
                  <CalendarDays size={15} />
                )}
              </span>
              <div>
                <strong>
                  {days <= 0
                    ? days === 0
                      ? "Due today"
                      : "Overdue deadline"
                    : "Upcoming deadline"}
                </strong>
                <p>{task.title}</p>
                <small>
                  {dateLabel(task.dueDate)} · {deadlineCopy(days)}
                </small>
              </div>
              <button
                className="notification-done"
                onClick={() => onStatusChange(task.id, "done")}
                aria-label={`Mark ${task.title} as done`}
              >
                <Check size={14} />
              </button>
            </div>
          );
        })
      ) : (
        <div className="notification-empty">
          <CheckCheck size={20} />
          <strong>You’re all clear</strong>
          <p>No overdue or upcoming deadlines in the next 7 days.</p>
        </div>
      )}
      <button className="mark-read" onClick={onClose}>
        <Check size={14} />{" "}
        {tasks.length ? "Review on the board" : "Everything is up to date"}
      </button>
    </div>
  );
}

function TaskCard({
  task,
  compact = false,
  onStatusChange,
  onEdit,
}: {
  task: Task;
  compact?: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(!compact);

  const toggleDetails = () => {
    if (compact) {
      setDetailsVisible((visible) => !visible);
    }
  };

  return (
    <article
      className={`task-card task-color-${task.color ?? "blue"} ${compact ? "is-compact" : ""} ${detailsVisible ? "details-visible" : ""}`}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button")) {
          toggleDetails();
        }
      }}
      onKeyDown={(event) => {
        if (
          compact &&
          (event.key === "Enter" || event.key === " ") &&
          event.target === event.currentTarget
        ) {
          event.preventDefault();
          toggleDetails();
        }
      }}
      {...(compact
        ? {
            role: "button",
            tabIndex: 0,
            "aria-expanded": detailsVisible,
            "aria-label": `${detailsVisible ? "Hide" : "Show"} details for ${task.title}`,
          }
        : {})}
    >
      <button
        className={`complete-task ${task.status === "done" ? "is-done" : ""}`}
        onClick={() =>
          onStatusChange(task.id, task.status === "done" ? "todo" : "done")
        }
        aria-label={
          task.status === "done"
            ? `Mark ${task.title} as not done`
            : `Mark ${task.title} as done`
        }
      >
        {task.status === "done" && <Check size={12} />}
      </button>
      <div className={`status-dot ${task.status}`} />
      <div className="task-main">
        <h3 className={task.status === "done" ? "completed" : ""}>
          {task.title}
        </h3>
        <div className="task-meta">
          <span className={`priority priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          <span className="task-date">
            <CalendarDays size={13} />
            {dateLabel(task.dueDate)}
          </span>
        </div>
      </div>
      <div className="status-control">
        <button
          className="edit-task-btn"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
        >
          <Pencil size={13} />
        </button>
        <div
          className="status-pills"
          role="group"
          aria-label={`Set status for ${task.title}`}
        >
          {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
            <button
              key={status}
              className={
                task.status === status
                  ? `status-pill active status-${status}`
                  : "status-pill"
              }
              onClick={() => onStatusChange(task.id, status)}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
        <button
          className="status-btn status-more"
          onClick={() => setOpen(!open)}
          aria-label={`More status options for ${task.title}`}
        >
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className="status-menu">
            {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(task.id, status);
                  setOpen(false);
                }}
              >
                {statusLabels[status]}{" "}
                {status === task.status && <Check size={13} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function TaskForm({
  task,
  groups,
  defaultGroupId,
  onClose,
  onAdd,
  onUpdate,
}: {
  task?: Task;
  groups: { id: string; name: string }[];
  defaultGroupId: string;
  onClose: () => void;
  onAdd?: (
    title: string,
    groupId: string,
    dueDate: string,
    priority: Task["priority"],
    color: Task["color"],
  ) => void;
  onUpdate?: (
    id: string,
    updates: Pick<Task, "title" | "dueDate" | "priority" | "color">,
  ) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [group, setGroup] = useState(task?.groupId ?? defaultGroupId);
  const [date, setDate] = useState(task?.dueDate ?? todayKey);
  const [priority, setPriority] = useState<Task["priority"]>(
    task?.priority ?? "Medium",
  );
  const [color, setColor] = useState<Task["color"]>(task?.color ?? "blue");
  const colors: { value: Task["color"]; label: string }[] = [
    { value: "blue", label: "Blue" },
    { value: "pink", label: "Pink" },
    { value: "yellow", label: "Yellow" },
    { value: "mint", label: "Mint" },
    { value: "lavender", label: "Lavender" },
  ];
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          if (task && onUpdate)
            onUpdate(task.id, {
              title: title.trim(),
              dueDate: date,
              priority,
              color,
            });
          else if (onAdd) onAdd(title.trim(), group, date, priority, color);
        }}
      >
        <div className="form-header">
          <div>
            <p className="eyebrow">{task ? "Edit item" : "New item"}</p>
            <h2>{task ? "Edit task" : "Add a task"}</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close task form"
          >
            <X size={20} />
          </button>
        </div>
        <label>
          Task name
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs your attention?"
          />
        </label>
        {!task && (
          <div className="form-grid">
            <label>
              Group
              <select
                value={group}
                onChange={(event) => setGroup(event.target.value)}
              >
                {groups.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          </div>
        )}
        {task && (
          <label>
            Due date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        )}
        <label>
          Priority
          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as Task["priority"])
            }
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>
        <fieldset className="color-field">
          <legend>Card background</legend>
          <div
            className="color-ribbon task-color-ribbon"
            role="radiogroup"
            aria-label="Card background"
          >
            {colors.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`color-swatch task-swatch-${item.value} ${color === item.value ? "selected" : ""}`}
                onClick={() => setColor(item.value)}
                role="radio"
                aria-checked={color === item.value}
                aria-label={item.label}
                title={item.label}
              >
                <span />
              </button>
            ))}
          </div>
        </fieldset>
        <button className="primary-btn form-submit" type="submit">
          {task ? "Save changes" : "Add to board"} <CirclePlus size={17} />
        </button>
      </form>
    </div>
  );
}

function GroupForm({
  group,
  onClose,
  onAdd,
  onUpdate,
}: {
  group?: TaskGroup;
  onClose: () => void;
  onAdd?: (
    name: string,
    description: string,
    accent: TaskGroup["accent"],
  ) => void;
  onUpdate?: (
    id: string,
    updates: Pick<TaskGroup, "name" | "description" | "accent">,
  ) => void;
}) {
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [accent, setAccent] = useState<TaskGroup["accent"]>(
    group?.accent ?? "blue",
  );
  const colors: {
    value: TaskGroup["accent"];
    label: string;
    className: string;
  }[] = [
    { value: "blue", label: "Deep twilight", className: "group-color-blue" },
    { value: "pink", label: "Punch red", className: "group-color-pink" },
    { value: "yellow", label: "Bright teal", className: "group-color-yellow" },
    { value: "teal", label: "Turquoise", className: "group-color-teal" },
    { value: "purple", label: "Mauve", className: "group-color-purple" },
    { value: "orange", label: "Honeydew", className: "group-color-orange" },
  ];
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          const values = {
            name: name.trim(),
            description:
              description.trim() || "A new space for meaningful progress",
            accent,
          };
          if (group && onUpdate) onUpdate(group.id, values);
          else if (onAdd) onAdd(values.name, values.description, values.accent);
        }}
      >
        <div className="form-header">
          <div>
            <p className="eyebrow">
              {group ? "Edit collection" : "New collection"}
            </p>
            <h2>{group ? "Rename task group" : "Add a task group"}</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close group form"
          >
            <X size={20} />
          </button>
        </div>
        <label>
          Group name
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Personal projects"
          />
        </label>
        <label>
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What belongs here?"
          />
        </label>
        <fieldset className="color-field">
          <legend>Color</legend>
          <div
            className="color-ribbon"
            role="radiogroup"
            aria-label="Group color"
          >
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`color-swatch ${color.className} ${accent === color.value ? "selected" : ""}`}
                onClick={() => setAccent(color.value)}
                role="radio"
                aria-checked={accent === color.value}
                aria-label={color.label}
                title={color.label}
              >
                <span />
              </button>
            ))}
          </div>
        </fieldset>
        <button className="primary-btn form-submit" type="submit">
          {group ? "Save changes" : "Create group"} <CirclePlus size={17} />
        </button>
      </form>
    </div>
  );
}

export default App;
