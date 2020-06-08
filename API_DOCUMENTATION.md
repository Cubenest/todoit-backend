
# todoit-backend



## Indices

* [Default](#default)

  * [getRequiredTodos](#1-getrequiredtodos)
  * [inviteUser](#2-inviteuser)
  * [searchAllTodos](#3-searchalltodos)
  * [deleteTodo](#4-deletetodo)
  * [updateTodo](#5-updatetodo)
  * [getTodos](#6-gettodos)
  * [getAllTodos](#7-getalltodos)
  * [createTodo](#8-createtodo)
  * [deleteGroup](#9-deletegroup)
  * [updateGroupUser](#10-updategroupuser)
  * [updateGroup](#11-updategroup)
  * [getGroup](#12-getgroup)
  * [getAllGroups](#13-getallgroups)
  * [createGroup](#14-creategroup)
  * [login](#15-login)
  * [Create account](#16-create-account)


--------


## Default



### 1. getRequiredTodos



***Endpoint:***

```bash
Method: GET
Type: 
URL: 
```



### 2. inviteUser



***Endpoint:***

```bash
Method: POST
Type: 
URL: http://localhost:3001/api/group/5ed6b6ba83d955127410a887
```



### 3. searchAllTodos



***Endpoint:***

```bash
Method: GET
Type: 
URL: http://localhost:3001/api/search/
```



### 4. deleteTodo



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: http://localhost:3001/api/todo/delete/5ed1722e003f330d2418fee9
```



### 5. updateTodo



***Endpoint:***

```bash
Method: GET
Type: 
URL: http://localhost:3001/api/todo/5ed1722e003f330d2418fee9
```



### 6. getTodos



***Endpoint:***

```bash
Method: GET
Type: 
URL: 
```



### 7. getAllTodos



***Endpoint:***

```bash
Method: GET
Type: 
URL: http://localhost:3001/api/group/5ed6b6ba83d955127410a887/todos
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| page | 1 |  |
| size | 6 |  |



### 8. createTodo



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: http://localhost:3001/api/group/5ed157d498ef1d0e9c0f8e24/todo
```



***Body:***

```js        
{
	"title" : "Get this done",
	"labels" : "Hack",
	"dueDate": "2020-05-28T07:25:28.831Z",
	"status":"1",
	"priority": "2"
}
```



### 9. deleteGroup



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: http://localhost:3001/api/group/5ed48a1bce85962080b5c4da
```



### 10. updateGroupUser



***Endpoint:***

```bash
Method: POST
Type: 
URL: http://localhost:3001/api/group/users/5ecea9ac2c5043254853eee7
```



### 11. updateGroup



***Endpoint:***

```bash
Method: POST
Type: 
URL: http://localhost:3001/api/group/5ecea9ac2c5043254853eee7
```



### 12. getGroup



***Endpoint:***

```bash
Method: GET
Type: 
URL: http://localhost:3001/api/group/5ed48a1bce85962080b5c4da
```



### 13. getAllGroups



***Endpoint:***

```bash
Method: GET
Type: 
URL: 
```



### 14. createGroup



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: http://localhost:3001/api/group/
```



***Body:***

```js        
{
	"name": "Group 1"
}
```



### 15. login



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: http://localhost:3001/login
```



***Body:***

```js        
{
	"email": "imshoaibf@gmail.com",
	"password": "sho123"
	
}
```



### 16. Create account



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: http://localhost:3001/signup
```



***Body:***

```js        
{
	"email": "imshoaibf@gmail.com",
	"password": "sho123",
	"confirmPassword": "sho123"
}
```



---
[Back to top](#todoit-backend)
> Made with &#9829; by [thedevsaddam](https://github.com/thedevsaddam) | Generated at: 2020-06-08 19:04:11 by [docgen](https://github.com/thedevsaddam/docgen)
