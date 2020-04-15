---
id: authorization
title: Authorization
sidebar_label: Authorization
---

Authorization in appy is implemented via the hapi ``scope`` endpoint property and the appy permission system.  Before we discuss the permission system, lets look at a quick explanation of how scopes work.

# Scopes

A scope object is just an array of string values.  In a nutshell, if an endpoint's scope property contains values, whenever a user authenticates their auth credentials must contain a scope object that has at least one value that matches a value in the endpoint's scope in order for them to be authorized to access that endpoint. Below is the description of the `scope` route property from the hapi docs:

> `scope` - the application scope required to access the route. Value can be a scope string or an array of scope strings. The authenticated credentials object scope property must contain at least one of the scopes defined to access the route. If a scope string begins with a + character, that scope is required. If a scope string begins with a ! character, that scope is forbidden. For example, the scope ['!a', '+b', 'c', 'd'] means the incoming request credentials' scope must not include 'a', must include 'b', and must include one of 'c' or 'd'. You may also access properties on the request object (query and params) to populate a dynamic scope by using {} characters around the property name, such as 'user-{params.id}'. Defaults to false (no scope requirements).

 To further clarify, consider this example:

Endpoint ``X`` contains a scope array with values:
 
```
['root','readUser','!-readUser']
```
  
User ``A`` authenticates with scope values:

```
['root','updateUser','createUser']
```

User ``B`` with values: 

```
['readUser','updateUser','createUser']
```

User ``C`` with values:

```
['updateUser','createUser','deleteUser']
```

and user ``D`` with values:

```
['root','-readUser']
```
In this example, both user ``A`` and user ``B`` will be authorized to access endpoint ``X`` since their scope contains at least one value in the endpoint's allowed scope.  However user ``C`` and user ``D`` will be denied access to endpoint ``X`` due to insufficient scope.

# appy Permission System

User scopes in appy are generated based on a combination of the user's ``Role``, ``Groups``, and ``Permissions``.  Each user is required to be assigned to a role, and can optionally be associated with one or more groups.  Users, roles, and groups can in turn each be associated with one or more permissions.  When a permission is assigned to a user, role, or group, a ``state`` property comes along with the association, which can either be set to `Included`, `Excluded`, or `Forbidden`.  

A user's `effective` permissions result from a combination of their assigned permissions and any permissions assigned to their role or groups.  The ``state`` property allows permissions to override each other based on priority, with user permissions containing the highest priority, followed by group permissions then role permissions:

```
User->Group->Role
```

After permission priorities have been resolved, permissions with state ``Included`` will be added to the user's allowed scope, and permissions with state ``Forbidden`` will be added to the user's forbidden scope.  This allows easy and specific configuration of user endpoint access.  In general, a user will gain the majority of it's permissions through it's role.  Those permissions will be further defined by any groups the user belongs to.  Finally a user might have a few specific permissions assigned directly to them.  A user's final scope is a combination of the user's role, groups, and effective permissions.  The examples below are a bit contrived, but should give you a good idea of how the permission system works with a user's scope:

User's Role: ``'Admin'``
Role Permissions: 

```javascript
[
  { name:'readUser', state:'Included' },
  { name:'updateUser', state:'Included' },
  { name:'addUserPermissions', state:'Included' },
  { name:'removeUserPermissions', state:'Included' }
]
```

User's Groups: ``['Managers']``
Group Permissions: 

```javascript
[
  { name:'updateUser', state:'Excluded' },
]
```

User: ``'test@manager.com'``
User Permissions: 

```javascript
[
  { name:'removeUserPermissions', state:'Excluded' },
]
```

Final User Scope:

```javascript
['Admin','Managers','readUser','addUserPermissions']
``` 

---

User's Role: ``'SuperAdmin'``
Role Permissions: 

```javascript
[
  { name:'user', state:'Included' },
  { name:'deleteUser', state:'Included' }
]
```

User's Groups: ``['Creators']``
Group Permissions: 

```javascript
[
  { name:'deleteUser', state:'Forbidden' },
  { name:'updateUser', state:'Forbidden' },
]
```

User: ``'test@creator.com'``
User Permissions: 

```javascript
[
  { name:'updateUser', state:'Included' },
]
```

Final User Scope:

```javascript
['SuperAdmin','Creators','user','updateUser','-deleteUser']
``` 

appy comes pre-defined (run ``$ gulp seed``) with several different user/group/role combinations that you can test out.  See the page on [Swagger Docs](https://github.com/JKHeadley/appy/wiki/Swagger-Docs) to learn how to login and access the test user emails via the ``GET /user`` endpoint (all passwords are ``root``).  It should also be pointed out that a user's final scope is sent as part of the response to the client when the user logs in, since these scope values could prove useful for client-side authorization as well.

# Permission Structure

Individual permissions for [generated endpoints](https://resthapi.com/docs/creating-endpoints.html) typically exist in some combination of a `verb`, `resource`, and `association`. The particular combination describes which endpoints the permission affects. Below are some examples:

`[verb][resource]`, Ex: `createUser`
- Effects the `POST /user` endpoint

`[verb]`, Ex: `update`
- Effects all `PUT /[resource]` endpoints. 
- Ex: `PUT /user/{_id}` or `PUT /blog/{_id}`

`[resource]`, Ex: `user`
- Effects all `user` endpoints, including association endpoints. 
- Ex: `POST /user`, `DELETE /user/{_id}`, or `POST /user/{ownerId}/blog`

`[verb][resource][association]`, Ex: `removeUserBlogs `
- Effects specific association endpoints for that resource.
- Ex: `DELETE /user/{ownerId}/blog` and `DELETE /user/{ownerId}/blog/{childId}`

How these permissions affect access to the endpoints for an individual user depends on their state (Included, Excluded, or Forbidden) and how they are assigned to the user (via a Role, Group, or directly to the User). See the [hierarchy description above](#appy-permission-system). 

These generated permissions directly relate to scope values generated for endpoints through rest-hapi. See [the rest-hapi docs](https://resthapi.com/docs/authorization.html#generating-route-scopes) for an example with a full list of [endpoint scope values](#scopes).

## Combining Permissions

Since some permissions affect a broader range of endpoints (e.g. `create` or `user`) while others have a more specific affect (e.g. `createUser` or `readUser`), this allows for permissions to be combined efficiently for specific results. For example, say you wanted a user to be able to create, update, and read blogs but not delete them. You could accomplish this by assigning the `user` permission with the state `Included` and the `deleteUser` permission with the state `Forbidden`. These permissions will be reflected in the user's scope as so:

scope: [`user`, `-deleteUser`]

As another example, say you wanted a user to have read access to all resources (`read`:`Included`) except the `user` resource (`readUser`:`Forbidden`). This would result in a user scope of:

scope: [`read`, `-readUser`]

**NOTE:** While efficient, use this approach with caution as it will provide read access to all future resources added to the system.

In general, when creating Roles, Groups, and combining Permissions, always follow the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

# Authorization Options

While the appy permission system allows for detailed control over user authorization, this is not always necessary (particularly when building smaller apps).  For this reason appy adds the names of the user's role and groups to the user's scope.  These values can be used for a much simpler, broader level of authorization.

## Generating Scopes and Permissions

By default, appy (via [rest-hapi](https://github.com/JKHeadley/rest-hapi)) automatically [generates scope values](https://resthapi.com/docs/authorization.html#generating-route-scopes) specific to each generated endpoint.  If the database has been seeded (via ``$ gulp seed``), then user permissions are also generated that match the generated endpoint scope values.  This makes endpoint authorization a simple task of assigning existing permissions/roles/groups to users.  

However, when a new model is added to the appy starter code, endpoint scopes will be automatically generated but the corresponding permissions will not.  To generate new permissions and update the list, run the command ``$ gulp update-permissions``.

For more details on scope generation and how to manually add scope values, see the [rest-hapi docs](https://resthapi.com/docs/authorization.html) on authorization.