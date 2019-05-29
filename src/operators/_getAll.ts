import { map, switchMap } from 'rxjs/operators';
import { OperatorFunction, fromEvent } from 'rxjs';

export default function getAll(): OperatorFunction<IDBObjectStore, any[]> {
    return objectStore$ => {
        const entries$ = objectStore$.pipe(
            map(objectStore => objectStore.getAll()),
            switchMap(request => fromEvent(request, 'success')),
            map((event: Event) => (event.target as IDBRequest).result)
        );

        return entries$;
    };
}
