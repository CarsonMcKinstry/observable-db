import { tap } from "rxjs/operators";
import { openDB, upgrade, createObjectStore } from "./src";

const db$ = openDB("todos", 1).pipe(upgrade(upgradeDB$ => upgradeDB$));

db$.subscribe();
