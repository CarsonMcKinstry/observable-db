import { tap, switchMap, mergeMap, concatMap } from 'rxjs/operators';
import { openDB, upgrade, createObjectStore, createIndex } from './src';
import { add, objectStore, getAll, get } from './src/operators';
import { merge } from 'rxjs';

const db$ = openDB('todos', 1).pipe(
    upgrade(upgradeDB$ => {
        const todos$ = upgradeDB$.pipe(
            createObjectStore('todos', { keyPath: 'id' }),
            createIndex('task', 'task')
        );

        return todos$;
    })
    // tap(console.log)
);

const todosOS$ = db$.pipe(objectStore('todos'));

const createTodo$ = todosOS$.pipe(
    add({ task: 'build an app', id: Math.floor(new Date() / 1000) }),
    concatMap(i => {
        return todosOS$.pipe(get(i));
    })
);

createTodo$.subscribe(console.log);
// const getTodos$ = db$.pipe(
//     objectStore('todos'),
//     getAll()
// );

// merge(createTodo$, getTodos$)
//     .pipe(tap(console.log))
//     .subscribe();
