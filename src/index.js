// const Koa = require('koa');
// const app = new Koa();
// const server = require('http').createServer(app.callback());
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ server });
// const Router = require('koa-router');
// const cors = require('koa-cors');
// const bodyparser = require('koa-bodyparser');

// app.use(bodyparser());
// app.use(cors());
// app.use(async (ctx, next) => {
//   const start = new Date();
//   await next();
//   const ms = new Date() - start;
//   console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
// });

// app.use(async (ctx, next) => {
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   await next();
// });

// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (err) {
//     ctx.response.body = { issue: [{ error: err.message || 'Unexpected error' }] };
//     ctx.response.status = 500;
//   }
// });

// class Item {
//   constructor({ id, name, author, available, publish_date, pages, date, version }) {
//     this.id = id;
//     this.name = name;
//     this.author = author;
//     this.available = available;
//     this.publish_date = publish_date;
//     this.pages = pages;
//     this.date = date;
//     this.version = version;
//   }
// }

// const items = [];
// for (let i = 0; i < 3; i++) {
//   items.push(new Item({ id: `${i}`, name: `name ${i}`, author:`author ${i}`, available:true, publish_date:new Date(Date.now() + i), pages:`${i + 232}` ,date: new Date(Date.now() + i), version: 1 }));
// }
// let lastUpdated = items[items.length - 1].date;
// let lastId = items[items.length - 1].id;
// const pageSize = 10;

// const broadcast = data =>
//   wss.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(data));
//     }
//   });

// const router = new Router();

// router.get('/item', ctx => {
//   // const ifModifiedSince = ctx.request.get('If-Modified-Since');
//   // if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
//   //   ctx.response.status = 304; // NOT MODIFIED
//   //   return;
//   // }
//   // const text = ctx.request.query.text;
//   // const page = parseInt(ctx.request.query.page) || 1;
//   // ctx.response.set('Last-Modified', lastUpdated.toUTCString());
//   // const sortedItems = items
//   //   .filter(item => text ? item.text.indexOf(text) !== -1 : true)
//   //   .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
//   // const offset = (page - 1) * pageSize;
//   // ctx.response.body = {
//   //   page,
//   //   items: sortedItems.slice(offset, offset + pageSize),
//   //   more: offset + pageSize < sortedItems.length
//   // };
//   ctx.response.body = items;
//   ctx.response.status = 200;
// });

// router.get('/item/:id', async (ctx) => {
//   const itemId = ctx.request.params.id;
//   const item = items.find(item => itemId === item.id);
//   if (item) {
//     ctx.response.body = item;
//     ctx.response.status = 200; // ok
//   } else {
//     ctx.response.body = { issue: [{ warning: `item with id ${itemId} not found` }] };
//     ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
//   }
// });

// const createItem = async (ctx) => {
//   const item = ctx.request.body;
//   if (!item.name || !item.author || !item.available) { // validation
//     ctx.response.body = { issue: [{ error: 'missing information' }] };
//     ctx.response.status = 400; //  BAD REQUEST
//     return;
//   }
//   item.id = `${parseInt(lastId) + 1}`;
//   lastId = item.id;
//   item.publish_date = new Date();
//   item.pages = 1;
//   item.available = true;
//   item.version = 1;
//   items.push(item);
//   ctx.response.body = item;
//   ctx.response.status = 201; // CREATED
//   broadcast({ event: 'created', payload: { item } });
// };

// router.post('/item', async (ctx) => {
//   await createItem(ctx);
// });

// router.put('/item/:id', async (ctx) => {
//   const id = ctx.params.id;
//   const item = ctx.request.body;
//   const itemId = item.id;
//   if (itemId && id !== item.id) {
//     ctx.response.body = { issue: [{ error: `Param id and body id should be the same` }] };
//     ctx.response.status = 400; // BAD REQUEST
//     return;
//   }
//   if (!itemId) {
//     await createItem(ctx);
//     return;
//   }
//   const index = items.findIndex(item => item.id === id);
//   if (index === -1) {
//     ctx.response.body = { issue: [{ error: `item with id ${id} not found` }] };
//     ctx.response.status = 400; // BAD REQUEST
//     return;
//   }
//   const itemVersion = parseInt(ctx.request.get('ETag')) || item.pages;
//   if (itemVersion < items[index].pages) {
//     ctx.response.body = { issue: [{ error: `Version conflict` }] };
//     ctx.response.status = 409; // CONFLICT
//     return;
//   }
//   // item.version++;
//   items[index] = item;
//   lastUpdated = new Date();
//   ctx.response.body = item;
//   ctx.response.status = 200; // OK
//   broadcast({ event: 'updated', payload: { item } });
// });

// router.del('/item/:id', ctx => {
//   const id = ctx.params.id;
//   const index = items.findIndex(item => id === item.id);
//   if (index !== -1) {
//     const item = items[index];
//     items.splice(index, 1);
//     lastUpdated = new Date();
//     broadcast({ event: 'deleted', payload: { item } });
//   }
//   ctx.response.status = 204; // no content
// });

// setInterval(() => {
//   lastUpdated = new Date();
//   lastId = `${parseInt(lastId) + 1}`;
//   const item = new Item({ id: lastId, name: `book ${lastId}`, author: `author ${lastId}`,publish_date: lastUpdated, pages: 1, available: true });
//   items.push(item);
//   console.log(`New book: ${item.name}`);
//   broadcast({ event: 'created', payload: { item } });
// }, 15000);

// app.use(router.routes());
// app.use(router.allowedMethods());

// server.listen(3000);

import Koa from 'koa';
import WebSocket from 'ws';
import http from 'http';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";
import { timingLogger, exceptionHandler, jwtConfig, initWss, verifyClient } from './utils';
import { router as noteRouter } from './book';
import { router as authRouter } from './auth';
import jwt from 'koa-jwt';
import cors from '@koa/cors';

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });
initWss(wss);

app.use(cors());
app.use(timingLogger);
app.use(exceptionHandler);
app.use(bodyParser());

const prefix = '/api';

// public
const publicApiRouter = new Router({ prefix });
publicApiRouter
  .use('/auth', authRouter.routes());
app
  .use(publicApiRouter.routes())
  .use(publicApiRouter.allowedMethods());

app.use(jwt(jwtConfig));

// protected
const protectedApiRouter = new Router({ prefix });
protectedApiRouter
  .use('/item', noteRouter.routes());
app
  .use(protectedApiRouter.routes())
  .use(protectedApiRouter.allowedMethods());

server.listen(3000);
console.log('started on port 3000');
