import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { openDB, OpenDBCallbacks, UpgradeFunction } from './src';

const upgrade: UpgradeFunction = db$ => {
    // TODO: Create the operators for creating object stores and indexes
    return db$.pipe(
        tap(dbInterface => {
            const db = dbInterface.result;
            const os = db.createObjectStore('todos', { keyPath: 'id' });
            os.createIndex('task', 'task');
        }),
    );
};

const todosDB$ = openDB('todos', 5, {
    upgrade,
});

todosDB$.subscribe();
// import * as faker from 'faker';
// import { merge, fromEvent, of, Observable, concat } from 'rxjs';
// import {
//     tap,
//     map,
//     mergeMap,
//     concatMap,
//     pluck,
//     ignoreElements,
// } from 'rxjs/operators';

// const dummyData = {
//     task: faker.lorem.sentence(2),
//     id: faker.random.uuid(),
// };

// // naive request handler with rxjs

// function mapEventToDBInterface(event) {
//     return {
//         transaction$: of(event.target.transaction),
//         objectStore$: of(event.target.source),
//         result: event.target.result,
//     };
// }

// function createObjectStoreOperator(objectStoreMapping) {
//     return db$ => {
//         return db$.pipe(
//             mergeMap(({ objectStore$ }) => objectStore$),
//             map(objectStoreMapping),
//             mergeMap(request => fromEvent(request, 'success')),
//             map(mapEventToDBInterface),
//         );
//     };
// }

// // function withResult(operator) {
// //     return (thing) => {
// //         const result = thing.result;
// //         return of(thing).pipe(
// //             mergeMap()
// //         )
// //     }
// // }

// const add = (data, key) =>
//     createObjectStoreOperator(objectStore => objectStore.add(data));

// const get = key =>
//     createObjectStoreOperator(objectStore => objectStore.get(key));

// const put = (data, key) =>
//     createObjectStoreOperator(objectStore => objectStore.put(data, key));

// const getAll = () => createObjectStoreOperator(os => os.getAll());

// const defaultStartupHandlers = {
//     upgrade: () => of(null),
// };

// function openDB(name, version, { upgrade } = defaultStartupHandlers) {
//     const request = indexedDB.open(name, version);

//     const upgrade$ = fromEvent(request, 'upgradeneeded').pipe(
//         map(event => {
//             const db = event.target.result;
//             return { result: db };
//         }),
//         mergeMap(db => upgrade(db)),
//         ignoreElements(),
//     );

//     // request.onupgradeneeded = db => {
//     //     const os = db.createObjectStore('todos', { keyPath: 'id' });
//     //     os.createIndex('task', 'task');
//     // };
//     // const db$ = Observable.create(observer => {
//     //     const success = event => {
//     //         const dbInterface = mapEventToDBInterface(event);
//     //         observer.next(dbInterface);
//     //         observer.complete();
//     //     };

//     //     const error = err => {
//     //         observer.error(err);
//     //     };

//     //     request.addEventListener('success', success);
//     //     request.addEventListener('error', error);

//     //     () => {
//     //         request.removeEventListener('success', success);
//     //         request.removeEventListener('error', error);
//     //     };
//     // });

//     // return db$;
//     const db$ = fromEvent(request, 'success').pipe(
//         map(event => {
//             const db = event.target.result;
//             // const tx = db.transaction('todos', 'readwrite');
//             // const objectStore = tx.objectStore('todos');
//             return {
//                 // objectStore$: of(objectStore),
//                 // transaction$: of(tx),
//                 result: event.target.result,
//             };
//         }),
//     );

//     return merge(upgrade$, db$);
// }

// openDB('todos', 2, {
//     upgrade: db => {
//         return of(db).pipe(
//             map(({ result }) =>
//                 result.createObjectStore('todos', { keyPath: 'id' }),
//             ),
//             map(os => {
//                 os.createIndex('task', 'task');
//                 return os;
//             }),
//         );
//     },
// })
//     .pipe(
//         getAll(),
//         // add(dummyData),
//         // mergeMap(db =>
//         //     of(db).pipe(
//         //         put({
//         //             task: 'dummy todo',
//         //             id: db.result,
//         //         }),
//         //     ),
//         // ),
//         // add(dummyData),
//         // tap(console.log),
//         // mergeMap(({ objectStore$, result }) => {
//         //     const next = objectStore$.pipe(get(result));

//         //     console.log(next);
//         //     return next;
//         // }),
//         pluck('result'),
//     )
//     .subscribe(console.log, console.log);

// // what if i made my own event interface?
// /**
//  * {
//  *  objectStore: Observable<IDBObjectStore>,
//  *  transaction: Observable<IDBTransaction>,
//  *  result: any
//  * }
//  */
