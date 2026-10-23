import { useCallback, useEffect, useRef, useState } from "react";
import { authRequest } from "./authApi.js";
import { defaultSchedule } from "./attendance.js";

export function useAttendance(userId) {
  const [data, setData] = useState({ attendance: [], marks: [], schedule: defaultSchedule });
  const [loaded, setLoaded] = useState(false), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const lock = useRef(false), revision = useRef(0), alive = useRef(true);
  const refresh = useCallback(async () => {
    const ticket = ++revision.current;
    try {
      const result = await authRequest("attendance");
      if (alive.current && ticket === revision.current) { setData(result); setLoaded(true); setError(""); }
    } catch (err) { if (alive.current && ticket === revision.current) setError(err.message); }
  }, []);
  useEffect(() => {
    alive.current = true;
    queueMicrotask(refresh); const timer = setInterval(() => { if (!lock.current) refresh(); }, 30000);
    const onFocus = () => { if (!lock.current) refresh(); };
    window.addEventListener("focus", onFocus);
    const deactivate = () => { alive.current = false; ++revision.current; };
    return () => { deactivate(); clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [userId, refresh]);
  const mutate = async (operation, draft) => {
    if (lock.current) throw new Error("Oldingi amal bajarilmoqda. Kuting.");
    lock.current = true; ++revision.current; setBusy(true);
    try {
      const result = await authRequest(operation ? `attendance/${operation}` : "attendance", draft);
      ++revision.current;
      if (alive.current) { setData(result); setError(""); setLoaded(true); }
      return result;
    } catch (err) { if (alive.current) setError(err.message); throw err; }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  };
  return { ...data, loaded, error, busy, refresh, mutate };
}
