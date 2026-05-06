"use client";

import { useEffect, useMemo, useReducer } from "react";

interface Options<T> {
  getKey: (item: T) => string;
  isPlaceholderData?: boolean;
  items: T[];
  page: number;
  resetKey: string;
}

interface KeyedItem<T> {
  item: T;
  key: string;
}

interface State<T> {
  items: T[];
  keys: string[];
  resetKey: string;
}

type Action<T> =
  | {
      type: "reset";
      entries: KeyedItem<T>[];
      resetKey: string;
    }
  | {
      type: "append";
      entries: KeyedItem<T>[];
      resetKey: string;
    };

function sameKeys(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((key, index) => key === right[index]);
}

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  const actionKeys = action.entries.map((entry) => entry.key);

  if (action.type === "reset") {
    if (state.resetKey === action.resetKey && sameKeys(state.keys, actionKeys)) {
      return state;
    }

    return {
      items: action.entries.map((entry) => entry.item),
      keys: actionKeys,
      resetKey: action.resetKey,
    };
  }

  if (state.resetKey !== action.resetKey) {
    return {
      items: action.entries.map((entry) => entry.item),
      keys: actionKeys,
      resetKey: action.resetKey,
    };
  }

  const seen = new Set(state.keys);
  const nextEntries = action.entries.filter((entry) => !seen.has(entry.key));

  if (!nextEntries.length) {
    return state;
  }

  return {
    items: [...state.items, ...nextEntries.map((entry) => entry.item)],
    keys: [...state.keys, ...nextEntries.map((entry) => entry.key)],
    resetKey: action.resetKey,
  };
}

export function useMobileAccumulatedList<T>({
  getKey,
  isPlaceholderData = false,
  items,
  page,
  resetKey,
}: Options<T>) {
  const entries = useMemo(
    () => items.map((item) => ({ item, key: getKey(item) })),
    [getKey, items],
  );
  const [state, dispatch] = useReducer(reducer<T>, {
    items,
    keys: entries.map((entry) => entry.key),
    resetKey,
  });

  useEffect(() => {
    if (isPlaceholderData) {
      return;
    }

    if (page <= 1) {
      dispatch({
        type: "reset",
        entries,
        resetKey,
      });
      return;
    }

    dispatch({
      type: "append",
      entries,
      resetKey,
    });
  }, [entries, isPlaceholderData, page, resetKey]);

  return { mobileItems: state.items };
}
