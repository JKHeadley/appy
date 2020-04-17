---
id: introduction
title: Introduction
sidebar_label: Introduction
---
 
<p align="center"><a href="https://appyapp.io" target="_blank" rel="noopener noreferrer"><img width="262" height="295" src="https://user-images.githubusercontent.com/12631935/39099920-eaab3d3e-4636-11e8-9955-b53be05e1c13.png" alt="appy logo"></a></p>

## What is appy?
appy is an open source fully featured full-stack web app + user system. It's purpose is two fold:

1) Provide a bootstrapping platform to quickly implement and test out [mvp](https://en.wikipedia.org/wiki/Minimum_viable_product) ideas.
2) Provide working examples of modern web-app features for those interested in learning how technologies can integrate.

While there are other open source full-stack web apps out there, we couldn't find any that sufficiently meet these goals. appy is built with technologies that allow you to quickly adapt it to your specific needs. Our goal is to provide a working platform with easy to follow documentaion covering all of the major features so you can bootstrap your own awesome app! 😉

While we feel appy is already a useful tool, there is awlays room for improvement. We aim to continue to improve appy and add more useful features as we go, and we would love for you to pitch in!

## Main Features

- **Frontend**: built with [Vue.js](https://vuejs.org)
- **Backend**: built with [hapi.js](https://hapi.dev/) and [rest-hapi](https://rest-hapi.com)
- **Datastore**: via MongoDB.
- **Aesthetic UI**: based on the [AdminLTE](https://adminlte.io) template.
- **Generated API**: based on [mongoose](http://mongoosejs.com/) schemas via [rest-hapi](https://rest-hapi.com)
- **Login Flows**: social login, account activation, and password reset.
- **Authorization**: user access based on roles, groups, and permissions.
- **Admin Tools**: views to manage user accounts and view app activity.
- **Swagger**: UI for easy api documentation and testing.
- **Websockets**: real-time features such as notifications and chat.
- **Social Network**: connect with and follow other users.
- **User Content**: shareable docs and image uploads.

## Live Demo

Want to see appy in action. Check out the live demo! [Create an account](https://demo.appyapp.io/register), [login with a social network](https://demo.appyapp.io/login), or try one of the demo accounts below.

<div class="landing">
  <section class="main special">
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Description</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>User</td>
            <td>They're everywhere! Users have access to all the standard features.</td>
            <td><a href="https://demo.appyapp.io/login?email=test@user.com&password=root"
              target="_blank" class="button special icon fa-sign-in">Try It!</a></td>
          </tr>
          <tr style="background-color: rgba(186, 171, 206, 0.41);">
            <td>Admin</td>
            <td>Taking care of business. Admins can manage user permissions and view audit
          logs.</td>
            <td><a href="https://demo.appyapp.io/login?email=test@admin.com&password=root"
              target="_blank" class="button special icon fa-sign-in">Try It!</a></td>
          </tr>
          <tr>
            <td>Super Admin</td>
            <td>The big boss! A super admin has access to all views and actions.</td>
            <td><a href="https://demo.appyapp.io/login?email=test@superadmin.com&password=root"
              target="_blank" class="button special icon fa-sign-in">Try It!</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>
