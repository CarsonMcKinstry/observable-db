import { Observable, of, fromEvent, merge } from 'rxjs';
import { map, mergeMap, ignoreElements } from 'rxjs/operators';

import { DBInterface } from './types';

interface OpenDBCallbacks {
    upgrade: (
        dbInterface: Pick<
            DBInterface<IDBDatabase>,
            Exclude<keyof DBInterface, 'objectStore$' | 'transaction$'>
        >,
    ) => Observable<any>;
}

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
    const request = indexedDB.open(name, version);

    const upgrade$ = fromEvent(request, 'upgradeneeded').pipe(
        mapToDBInterface(),
        mergeMap(db => upgrade(db)),
        ignoreElements(),
    );

    const db$ = fromEvent(request, 'success').pipe(mapToDBInterface());

    return merge(upgrade$, db$);
}
