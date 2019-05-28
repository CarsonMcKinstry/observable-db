// function transaction(storeNames, mode) {
//   return function(dbEvent$) {
//     const transaction$ = dbEvent$.pipe(
//       map(db => db.transaction(storeNames, mode)),
//     );

//     const transactionComplete$ = transaction$.pipe(
//       mergeMap(transaction => fromEvent(transaction, "complete")),
//       shareReplay()
//     );

//     return merge(transaction$, transactionComplete$)
//   };
// }

// function transactionComplete(cb) {
//   return function(stream$) {
//     const transactionCompleteEvent$ = stream$.pipe(
//       filter(
//         ({ type, target }) =>
//           type === "complete" && target instanceof IDBTransaction
//       ),
//       tap(event => {
//         cb && typeof cb === "function" && cb(event);
//       }),
//       shareReplay()
//     );

//     return merge(stream$, transactionCompleteEvent$).pipe(
//       filter(
//         ({ type, target }) =>
//           type !== "complete" && !(target instanceof IDBTransaction)
//       )
//     );
//   };
// }

// const db$ = openDB("todoList", 8).pipe(
//   upgrade(db$ => {
//     const todosOS$ = db$.pipe(
//       createObjectStore("todos", { keyPath: "id" }),
//       createIndex("task", "task")
//     );

//     const usersOS$ = db$.pipe(
//       createObjectStore("users", { keyPath: "id" }),
//       createIndex("name", "name")
//     );

//     return merge(todosOS$, usersOS$);
//   })
// );

// const tx$ = db$.pipe(
//   transaction(['users', 'todos']),
//   transactionComplete(() => {
//     console.log('tx complete');
//   })
// )

// const getUsers$ = tx$.pipe(
//   objectStore('users'),
//   getAll()
// );

// const getTodos$ = tx$.pipe(
//   objectStore('todos'),
//   getAll()
// );

// merge(getUsers$, getTodos$).subscribe(console.log);
