---
id: authentication
title: Authentication
sidebar_label: Authentication
---

Three optional authentication strategies come included with appy, each implementing the [hapi-auth-jwt2](https://www.npmjs.com/package/hapi-auth-jwt2) plugin via Javascript Web Tokens (JWTs). JWTs have gained popularity in recent years due to their stateless nature and ability to carry encrypted authentication and authorization credentials, as well as a built-in expiration date.  Below we will cover the reasoning behind each authentication strategy in appy and discuss their pros and cons.

## Standard Token

The simplest strategy uses a single JWT that stores a ``user`` object and a ``scope`` object containing the user's authorization credentials.  This token generally has a long life span/expiration period, however once the token expires the user is forced to re-authenticate (by logging in).

### Pros
- Simple, easy to implement for both server and client
- Efficient (very little processing and no db communication)

### Cons
- Least secure option as the token has a long lifetime, and cannot be invalidated if it is compromised
- Creates unpleasant user experience by forcing them to login periodically

## Session

In this strategy, a unique ``session`` database document is created upon user login that contains the user id, a unique key, and the user's hashed password.  A token containing the session credentials is sent as a response.  Whenever a user authenticates using the token, the server uses the session credentials to validate that the session exists before authenticating the user.  This token also has a long life span, however whenever the user logs out, the session is deleted which invalidates the token immediately.  Since the session uses the user's hashed password as a part of validating the session, the token will also be invalidated when the user changes their password.  Finally, every time the user successfully authenticates, a fresh token is generated and sent back in the response header.  The client can then use this new token to prevent the user from having to login unless they are inactive for the entire lifetime of the token.

### Pros
- Most secure option, as tokens can be immediately invalidated by either logging out, changing the user's password, or just deleting the session
- Generating fresh tokens means the user is never forced to re-login unless they are inactive for a long time

### Cons
- Least efficient option as multiple database queries are made for every request that needs authentication, along with extra cpu usage for generating a fresh token on every request
- Much more complex on the server side, and slightly more complex for the client if they wish to use the fresh tokens in the response header

## Refresh Token

This strategy aims to combine the Standard Token and Session strategies to result in a strategy that is both secure and efficient.  When a user logs in they receive a response containing both a standard token, and a refresh token that is identical to the session token.  The main difference here is that the expiration date of the standard (or 'access') token is set to a very short period (usually only a few minutes).  The existence of this access token means that the majority of requests can be treated identically to the Standard Token strategy, which means efficient processing and no database queries.  However once the access token expires, the client can switch to using the refresh token on the next request.  This token is then treated identically to the Session strategy.  When a refresh token is validated, a fresh set of refresh and access tokens are sent back to the client in the response header.  The client can then resume using the more efficient access token.  

Since the refresh token is tied to a session, it can be invalidated the same way a session token can.  While the access token can't be invalidated, its short lifespan reduces the potential security threat.  This results in the Refresh Token strategy being more secure than the Standard Token strategy, and more efficient than the Session strategy.

### Pros
- Best of both worlds as far as security and efficiency
- Client does not have to force user to re-login

### Cons
- Most complex option on both client and server side
- Not as efficient as Standard Token, but almost
- Not as secure as Session, but almost


> **NOTE** The appy authentication strategy can be set by modifying the [``restHapiConfig.authStrategy``](https://github.com/JKHeadley/appy-backend/blob/master/config/index.js#L220) property in ``config/index.js``.
