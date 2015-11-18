# Marionette Forms

[![NPM](https://nodei.co/npm/marionette.forms.png)](https://npmjs.org/package/marionette.forms)

This library adds some useful functionality to Marionette and Backbone in order
to make it easier to create any kind of form in Marionette.

Unlike other libraries this doesn't try to render anything on your behalf.
That's your job! You've got to make forms which are suitable for your users,
and we can't do that for you.

But, this library will sort out a lot of the extra stuff you need to write
in order to make forms work on the client:

* Model loaded States
* Validation
* Easy management of views

This library goes really nicely with [Marionette Binding](https://github.com/mypebble/marionette-binding).

## Models

This library uses the model to validate the contents of your model. This is
why we use Marionette Binding to keep the model up to date.

```js
var DemoModel = MarionetteForms.FormModel.extend({
  validation: {
    name: /^[a-zA-Z ]+$/,
    tandcs: MarionetteForms.Required
  },

  defaults: {
    name: "",
    tandcs: null
  }
});
```

The validation hash is against a key in the model and a value. You can use
an array of validation rules if you'd like as well.

### Validation Rules

Validation rules typically are Regexp objects, but can really be anything
so long as they take a `test(value)` function that returns true or false.

To get a custom message simply set a `message` value or function on the object
and it'll be displayed when there is an issue.

Built in validation rules:

* `Required` Requires a value which is not undefined, null or false and as a
  string has a length greater than one.
* `Email` Validates a basic email address. It's not exact as all it does it
  does is check for an @ symbol and then a period afterwards.

## Views

`FormLayoutView` and `FormViewMixin` are used to add some shortcuts to writing
forms.

It by default includes a template handler which can be optionally used to
specify a template based on the state of the model:

```js
var DemoView = MarionetteForms.FormLayoutView.extend({
  templates: {
    error: require("../templates/error.html"),
    loading: require("../templates/loading.html"),
    normal: require("../templates/normal.html")
  },

  modelEvents: {
    "state": "render"
  }
})
```

Also some handy template helpers:

* `state` returns the state of the model
* `error(field)` returns the errors for the specified model attribute.

Also note the modelEvents hash. This is just telling Marionette we want to
render the view whenever the model has changed it's state.

### Error function

The error function by default returns the list of errors joined by a newline.
This probably isn't what you want your application to display as you
will want to style them.

We use a renderError function to do so and it's easy to override for your
own needs.

To do so, implement something like so:

```js
var DemoView = MarionetteForms.FormLayoutView.extend({
  renderError: function(err){
    if(err.length == 0) return;
    return '<div class="error">'+err.join("<br/>")+'</div>';
  },

  modelEvents: {
    "state": "render"
  }
});
```

Bearing in mind with this example we are trusting no user input will be
returned. If your error messages contain user input, you will need to ensure
they are escaped. (see `_.escape`)

Then in your view all you need:

```html
<%= error("tandcs") %>
<label>
  <input type="checkbox" class="tandcs_value" />
  I accept the terms and conditions
</label>
```
