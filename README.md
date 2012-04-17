# Gum.js - The elastic node.js framework

### Start small - grow fast

Gum.js is a framework which helps you writing a code which can run on a micro instance, but it can be instantly scaled up and down on demand.

# Usage

You define your business logic:

```js
var gum = require('gum.js');

gum.frontend = {
  user_registration : function() {
    var user = {
      name : "Balazs Nagy"
    }
    gum.db.write_user(user);
  }
}

gum.db = {
  write_user : function(user) {
    save(user);
  }
}
```

And start your node with a single instance

```js
gum.chew();
```

Or start different types of instances in that amount you want

```js
// start_frontend.js
gum.chew(['frontend']);

// start_db.js
gum.chew(['db']);
```

# How it works

When you chew your gum every function for each role which are not defined will be stubbed with a remote process call. This means that the function will be routed to the proper node where it will be executed.