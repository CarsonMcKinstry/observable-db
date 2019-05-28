import { fromEvent, OperatorFunction } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export default function(
  data: any,
  key?: IDBArrayKey
): OperatorFunction<IDBObjectStore, IDBArrayKey> {
  return objectStore$ => {
    const entry$ = objectStore$.pipe(
      map(objectStore => objectStore.add(data, key)),
      switchMap((request: IDBRequest) => fromEvent(request, "success")),
      map((event: Event) => (event.target as IDBRequest).result)
    );

    return entry$;
  };
}
