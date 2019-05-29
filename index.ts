import { tap } from "rxjs/operators";
import { openDB, upgrade, createObjectStore, createIndex } from "./src";

const db$ = openDB("todos", 1).pipe(
  upgrade(upgradeDB$ => {
    const todos$ = upgradeDB$.pipe(
      createObjectStore("todos", { keyPath: "id" }),
      createIndex("task", "task")
    );

    return todos$;
  })
);

db$.subscribe();
