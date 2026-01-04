import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function formatTime(dt) {
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Calendar() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [cursor, setCursor] = useState(new Date()); // current displayed month

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.tutoring.listSessions();
        setSessions(
          data.map((s) => ({
            ...s,
            scheduledTime: s.scheduledTime ? new Date(s.scheduledTime) : null,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const first = startOfMonth(cursor);
  const totalDays = daysInMonth(cursor);
  const startWeekday = first.getDay(); // 0 = Sun

  // build calendar cells array for month view
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++)
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  const sessionsByDate = {};
  sessions.forEach((s) => {
    if (!s.scheduledTime) return;
    const key = s.scheduledTime.toISOString().slice(0, 10);
    sessionsByDate[key] = sessionsByDate[key] || [];
    sessionsByDate[key].push(s);
  });

  const prevMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Tutoring Calendar</h2>
        <div>
          <button onClick={prevMonth} style={{ marginRight: 8 }}>
            Prev
          </button>
          <button onClick={nextMonth}>Next</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </strong>
      </div>

      <table
        className="calendar"
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
      >
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <th
                key={d}
                style={{
                  padding: 8,
                  textAlign: "left",
                  borderBottom: "1px solid var(--gray-200)",
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(Math.ceil(cells.length / 7))].map((_, rowIdx) => (
            <tr key={rowIdx}>
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((dt, i) => {
                const iso = dt ? dt.toISOString().slice(0, 10) : null;
                const daySessions = iso ? sessionsByDate[iso] || [] : [];
                return (
                  <td
                    key={i}
                    style={{
                      verticalAlign: "top",
                      padding: 8,
                      borderRight: "1px solid var(--gray-100)",
                      minHeight: 80,
                    }}
                  >
                    {dt ? (
                      <div>
                        <div style={{ fontWeight: 700 }}>{dt.getDate()}</div>
                        {daySessions.map((s) => (
                          <div
                            key={s._id}
                            style={{
                              marginTop: 6,
                              padding: 6,
                              background: "#fff",
                              border: "1px solid #eee",
                              borderRadius: 6,
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                              {s.subject}
                            </div>
                            <div style={{ fontSize: 12 }}>
                              {formatTime(s.scheduledTime)}
                            </div>
                            <div
                              style={{ fontSize: 12, color: "var(--gray-600)" }}
                            >
                              {s.tutor?.name} → {s.learner?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
