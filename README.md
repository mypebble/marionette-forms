# Marionette Forms

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

This library is an extra bit on top of [Marionette Binding](https://github.com/mypebble/marionette-binding).


## Validation Rules

Validation rules are typical just Regexp objects, but can really be anything
so long as they take a `test(value)` function that returns true or false.

To get a custom message simply set a `message` value or function on the object and
it'll be displayed when there is an issue.
