const MAX_HISTORY = 50;

export interface HistoryState<S> {
  past: S[];
  present: S;
  future: S[];
}

export function createHistory<S>(initialState: S): HistoryState<S> {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

export function pushState<S>(
  history: HistoryState<S>,
  newState: S,
): HistoryState<S> {
  const past = [...history.past, history.present];
  // Trim to max history size
  if (past.length > MAX_HISTORY) {
    past.splice(0, past.length - MAX_HISTORY);
  }
  return {
    past,
    present: newState,
    future: [],
  };
}

export function undo<S>(history: HistoryState<S>): HistoryState<S> {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  return {
    past: newPast,
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo<S>(history: HistoryState<S>): HistoryState<S> {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  const newFuture = history.future.slice(1);
  return {
    past: [...history.past, history.present],
    present: next,
    future: newFuture,
  };
}
