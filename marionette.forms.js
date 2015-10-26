var MarionetteBinding = require('marionette.binding');
var Backbone = require('backbone');
var _ = require('underscore');

var ModelState = {
  Initial: "initial",
  Saved: "saved",
  // Failed to load
  Failure: "fail",
  Synced: "synced",
  // error is where there are validation errors
  Error: "error",
  Loading: "loading"
};


var FormModelMixin = {
  validation: {},
  errors: {},
  state: ModelState.Initial,

  initialize: function(){
    this.on('sync', this.onSync);
  },

  save: function(){
    // Override the save function to do our validation
    if(!this.valid()){
      return this.trigger('state error');
    }

    this.state = ModelState.Loading;
    this.trigger('state');

    var self = this;
    return this.saveServer.apply(this, arguments).done(function(){
        self.state = ModelState.Saved;
        self.trigger('saved');
    }).fail(function(res, textStatus, errorThrown){
        // Handle failure
        if(res.status >= 400 && res.response < 500){
          // Request Error
          self.parseError.call(self, res);
          self.state = ModelState.Error;
          self.trigger('state error error400', res);
        } else{
          self.state = 'fail';
          self.trigger('state error error' + res.status, res);
        }
    });
  },

  saveServer: function(){
    return Backbone.Model.prototype.save.apply(this, arguments);
  },

  parseError: function(res){
    // By default can parse Django Rest Framework Responses!
    _.each(res.responseJSON, function(v, k){
      this.addError(k, v);
    });
  },

  valid: function(){
    var valid = true;
    this.errors = {}; // Clear errors

    _.each(this.validation, function(rules, key){
      var value = this.get(key);
      if(!Array.isArray(rules)){
        rules = [rules];
      }
      _.each(rules, function(rule){
        if(rule.test(value) == false){
          valid = false;
          this.addError(key, _.result(rule, 'message', 'Invalid value'));
        }
      }, this);
    }, this);
    return valid;
  },

  addError: function(what, msg){
    if(!this.errors[what]){
      this.errors[what] = [];
    }
    if(Array.isArray(msg)){
      _.each(msg, function(m){
        this.errors[what].push(m);
      }, this);
    } else{
      this.errors[what].push(msg);
    }
  },

  onSync: function(){
    this.state = 'synced';
    this.trigger('state');
  },

  fetchIfNeeded: function(){
    if(this.state != 'synced'){
      return this.fetch();
    }
  }
};
var FormModel = Backbone.Model.extend(FormModelMixin);

var FormViewMixin = {
  template: function(){
    switch(this.model.state){
      case ModelState.Failure:
        return this.templates['error'];
      case ModelState.Loading:
        return this.templates['loading'];
      case ModelState.Synced:
      case ModelState.Error: // Validation error, show form
      case ModelState.Initial:
        return this.templates['normal'];
    }
  },

  renderError: function(msg){
    return msg.join("\n");
  },

  templateHelpers: function(){
    var context = _.result(this.__proto__.constructor.__super__, 'templateHelpers', {});
    context['error'] = _.bind(function(field){
      if(!this.model) return;

      if(this.model.errors[field]){
        return this.renderError(this.model.errors[field]);
      }
    }, this);
    if(this.model){
      context['state'] = this.model.state;
    } else{
      context['state'] = 'null';
    }
    return context;
  }
};
var FormLayoutView = MarionetteBinding.BindedView.extend(FormViewMixin);

// Validation Rules
var Required = {
  test: function(value){
    if(value == null || value == undefined || value == false
        || value.toString().length == 0){
      return false;
    }
    return true;
  },
  message: 'This field is required'
}

var EmailAddress = /^[^\@]+\@.+\..+$/; // This is as good as it needs to be
EmailAddress.message = 'A valid email address is required';


module.exports = {
  'FormModel': FormModel,
  'FormModelMixin': FormModelMixin,
  'FormLayoutView': FormLayoutView,
  'FormViewMixin': FormViewMixin,

  'ModelState': ModelState,

  // Validation rules
  'Required': Required,
  'EmailAddress': EmailAddress
};
