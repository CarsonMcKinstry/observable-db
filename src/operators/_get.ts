// import { map, switchMap } from "rxjs/operators";
// import { OperatorFunction, fromEvent } from "rxjs";

// export function get(
//   key: IDBValidKey | IDBKeyRange
// ): OperatorFunction<IDBObjectStore, any> {
//   return objectStore$ => {
//     const entry$ = objectStore$.pipe(
//       map(objectStore => objectStore.get(key)),
//       switchMap(request => fromEvent(request, "success")),
//       map((event: Event) => (event.target as IDBRequest).result)
//     );

//     return entry$;
//   };
// }

import { generateOSOperator } from "../utils";

export default function get(key: IDBValidKey | IDBKeyRange) {
  return generateOSOperator(objectStore => objectStore.get(key));
}
