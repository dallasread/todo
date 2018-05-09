// var List = require('./list'),
//     lists = new List({
//         data: {
//             title: 'My Lists',
//             items: [
//                 {
//                     title: 'My Stuff',
//                     items: [
//                         { title: 'Do stuff' },
//                         { title: 'Do more stuff' },
//                         { title: 'Write stuff' },
//                         { title: 'Read stuff' },
//                         { title: 'Exercise stuff' }
//                     ]
//                 }
//             ]
//         }
//     });

// console.log(lists);

// document.body.appendChild(lists.element);
// // document.body.appendChild(lists.data.items[0].element);

var App = require('./app'),
    app = new App();

window.app = app;

document.body.appendChild(app.element);
