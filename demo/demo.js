'use strict';

window._ = require('underscore');
var MarionetteForms = require('../marionette.forms');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

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


var DemoForm = MarionetteForms.FormLayoutView.extend({
  template: function(context){
    return _.template(`<div>
  <% if(state == 'loading'){ %>
    wait...
  <% } %>
  <%= error('name') %>
  <label>
    Name:
    <input type="text" class="name_value" />
  </label>
  <%= error("tandcs") %>
  <label>
    <input type="checkbox" class="tandcs_value" />
    I accept the terms and conditions
  </label>
  <button type="submit">
    Save!
  </button>
</div>`)(context);
  },

  ui: {
    name: ".name_value",
    tandcs: ".tandcs_value",
    submit: "button"
  },

  bindings: {
    "value @ui.name": "name",
    "checked @ui.tandcs": "tandcs"
  },

  triggers: {
    "click @ui.submit": "submit"
  },

  onSubmit: function(){
    this.model.save();
  },

  modelEvents: {
    "state": "render",
    "sync": "render"
  },

  renderError: function(err){
    if(err.length == 0) return;
    return '<div class="error">'+err.join("<br/>")+'</div>';
  }
});

var regions = new Marionette.RegionManager({
  regions: {
    body: "#content"
  }
});

var view = new DemoForm({
  model: new DemoModel()
});
regions.get("body").show(view);
module.exports = view;
