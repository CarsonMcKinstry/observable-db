import * as faker from 'faker';
import { fromEvent, of, Observable } from 'rxjs';
import { tap, map, mergeMap, concatMap, pluck } from 'rxjs/operators';

const dummyData = {
    task: faker.lorem.sentence(2),
    id: faker.random.uuid(),
};

// const request = indexedDB.open('todos', 2);

// request.onupgradeneeded = db => {
//     const os = db.createObjectStore('todos', { keyPath: 'id' });
//     os.createIndex('task', 'task');
// };

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

//         const putRequest = objectStore.put({
//             task: 'other dummy data',
//             id: value,
//         });

//         // const getRequest = objectStore.get(value);

//         putRequest.addEventListener('success', getEvent => {
//             console.log(getEvent.target.result);
//         });
//     });
// });

// naive request handler with rxjs

function mapEventToDBInterface(event) {
    return {
        transaction$: of(event.target.transaction),
        objectStore$: of(event.target.source),
        result: event.target.result,
    };
}

function createObjectStoreOperator(objectStoreMapping) {
    return db$ => {
        return db$.pipe(
            mergeMap(({ objectStore$ }) => objectStore$),
            map(objectStoreMapping),
            mergeMap(request => fromEvent(request, 'success')),
            map(mapEventToDBInterface),
        );
    };
}

// function withResult(operator) {
//     return (thing) => {
//         const result = thing.result;
//         return of(thing).pipe(
//             mergeMap()
//         )
//     }
// }

const add = (data, key) =>
    createObjectStoreOperator(objectStore => objectStore.add(data));

const get = key =>
    createObjectStoreOperator(objectStore => objectStore.get(key));

const put = (data, key) =>
    createObjectStoreOperator(objectStore => objectStore.put(data, key));

function openDB(name, version) {
    const request = indexedDB.open(name, version);

    request.onupgradeneeded = db => {
        const os = db.createObjectStore('todos', { keyPath: 'id' });
        os.createIndex('task', 'task');
    };
    // const db$ = Observable.create(observer => {
    //     const success = event => {
    //         const dbInterface = mapEventToDBInterface(event);
    //         observer.next(dbInterface);
    //         observer.complete();
    //     };

    //     const error = err => {
    //         observer.error(err);
    //     };

    //     request.addEventListener('success', success);
    //     request.addEventListener('error', error);

    //     () => {
    //         request.removeEventListener('success', success);
    //         request.removeEventListener('error', error);
    //     };
    // });

    // return db$;
    return fromEvent(request, 'success').pipe(
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
    );
}

openDB('todos', 2)
    .pipe(
        add(dummyData),
        // mergeMap(db =>
        //     of(db).pipe(
        //         put({
        //             task: 'dummy todo',
        //             id: db.result,
        //         }),
        //     ),
        // ),
        // add(dummyData),
        // tap(console.log),
        // mergeMap(({ objectStore$, result }) => {
        //     const next = objectStore$.pipe(get(result));

        //     console.log(next);
        //     return next;
        // }),
        pluck('result'),
    )
    .subscribe(console.log, console.log);

// what if i made my own event interface?
/**
 * {
 *  objectStore: Observable<IDBObjectStore>,
 *  transaction: Observable<IDBTransaction>,
 *  result: any
 * }
 */
