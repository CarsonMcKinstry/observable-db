import { Observable, of, fromEvent, merge, Subscriber } from 'rxjs';
import { map, mergeMap, ignoreElements } from 'rxjs/operators';

import { OpenDBCallbacks } from './types';

function defaultUpgrade() {
    return of(null);
}

const mapToDBInterface = () =>
    map((event: Event) => ({
        result: (event.target as IDBRequest).result as IDBDatabase,
    }));

export default function openDB(
    name: string,
    version: number,
    { upgrade = defaultUpgrade }: OpenDBCallbacks,
) {
    const req$ = Observable.create((observer: Subscriber<any>) => {
        const request = indexedDB.open(name, version);
        observer.next(request);
        observer.complete();
    });
    // const request = indexedDB.open(name, version);

    const upgrade$ = req$.pipe(
        mergeMap((request: IDBRequest) => fromEvent(request, 'upgradeneeded')),
        mapToDBInterface(),
        upgrade,
        ignoreElements(),
    );

    const db$ = req$.pipe(
        mergeMap((request: IDBRequest) => fromEvent(request, 'success')),
        mapToDBInterface(),
    );

    return merge(upgrade$, db$);
}
