import { fromEvent, OperatorFunction } from "rxjs";
import { switchMap, map } from "rxjs/operators";

type ObjectStoreMapping = (
  objectStore: IDBObjectStore | IDBIndex
) => IDBRequest;

export default function createObjectStoreOperator(
  mapping: ObjectStoreMapping
): OperatorFunction<IDBObjectStore | IDBIndex, any> {
  return objectStore$ => {
    const result$ = objectStore$.pipe(
      map(mapping),
      switchMap(request => fromEvent(request, "success")),
      map((event: Event) => (event.target as IDBRequest).result)
    );
    return result$;
  };
}
