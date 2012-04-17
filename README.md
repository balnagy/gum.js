# Gum.js - The elastic node.js framework

Start small - grow fast

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

Or start scaling and separating different types of instances

```js
// start_frontend.js
gum.chew(['frontend']);

// start_db.js
gum.chew(['db']);
```