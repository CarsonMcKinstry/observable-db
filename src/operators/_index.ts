import { OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";

export default function(
  name: string
): OperatorFunction<IDBObjectStore, IDBIndex> {
  return objectStore$ => {
    const index$ = objectStore$.pipe(
      map(objectStore => objectStore.index(name))
    );
    return index$;
  };
}
