import * as faker from 'faker';
import { fromEvent, of } from 'rxjs';
import { tap, map, mergeMap, pluck } from 'rxjs/operators';

const dummyData = {
    task: faker.lorem.sentence(2),
    id: faker.random.uuid(),
};

const request = indexedDB.open('todos', 2);

request.onupgradeneeded = db => {
    const os = db.createObjectStore('todos', { keyPath: 'id' });
    os.createIndex('task', 'task');
};

// plain request handler without rxjs

// request.addEventListener('success', openEvent => {
//     const db = openEvent.target.result;

//     const tx = db.transaction('todos', 'readwrite');

//     const objectStore = tx.objectStore('todos');

//     const addRequest = objectStore.add(dummyData);

//     addRequest.addEventListener('success', addEvent => {
//         const {
//             target: { source: objectStore, result: value },
//         } = addEvent;

//         const getRequest = objectStore.get(value);

//         getRequest.addEventListener('success', getEvent => {
//             console.log(getEvent.target.result);
//         });
//     });
// });

// naive request handler with rxjs

fromEvent(request, 'success')
    .pipe(
        // map(openEvent => openEvent.target.result),
        map(event => {
            const db = event.target.result;
            const tx = db.transaction('todos', 'readwrite');
            const objectStore = tx.objectStore('todos');
            return {
                objectStore$: of(objectStore),
                transaction$: of(tx),
                result: db,
            };
        }),
        // add
        mergeMap(({ objectStore$ }) => {
            return objectStore$.pipe(
                map(objectStore => objectStore.add(dummyData)),
                mergeMap(request => fromEvent(request, 'success')),
                map(event => ({
                    transaction$: of(event.target.transaction),
                    objectStore$: of(event.target.source),
                    result: event.target.result,
                })),
            );
        }),
        tap(({ result }) => console.log(result)),
        // get
        mergeMap(({ result, objectStore$ }) => {
            return objectStore$.pipe(
                map(objectStore => objectStore.get(result)),
                mergeMap(request => fromEvent(request, 'success')),
                map(event => ({
                    transaction$: of(event.target.transaction),
                    objectStore$: of(event.target.source),
                    result: event.target.result,
                })),
            );
        }),
        // get, based on what is coming from add
        // mergeMap(eventOrObjectStore => {
        // const {
        //     target: { result, source },
        // } = event;
        // const request = source.get(result);

        // return fromEvent(request, 'success');
        // }),
        // mergeMap(objectStore => {
        //     const request = objectStore.getAll();
        //     return fromEvent(request, 'success').pipe(
        //         map(event => ({
        //             transaction$: of(event.target.transaction),
        //             objectStore$: of(event.target.source),
        //             result: event.target.result,
        //         })),
        //     );
        // }),
        // pluck('target', 'result'),
        // pluck('task'),
        tap(({ result }) => console.log(result)),
    )
    .subscribe();

// what if i made my own event interface?
/**
 * {
 *  objectStore: Observable<IDBObjectStore>,
 *  transaction: Observable<IDBTransaction>,
 *  result: any
 * }
 */
