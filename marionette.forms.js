var MarionetteBinding = require('marionette.binding');
var Backbone = require('backbone');
var _ = require('underscore');

var FormModelMixin = {
  validation: {},
  errors: {},
  state: 'initial',

  initialize: function(){
    this.on('sync', this.onSync);
  }

  save: function(){
    // Override the save function to do our validation
    if(!this.valid()){
      return this.trigger('errors');
    }

    var self = this;
    return this.prototype.save.call(this).done(function(){
        self.state = 'saved';
        self.trigger('saved');
    }).fail(function(res, textStatus, errorThrown){
        // Handle failure
        if(res.status >= 400 && res.response < 500){
          // Request Error
          self.parseError.call(self, res);
          self.state = 'req-fail';
          self.trigger('error error400', res);
        } else{
          self.state = 'fail';
          self.trigger('error error' + res.status, res);
        }
    });
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
      var value = this.model.get(key);
      _.each(rules, function(rule){
        if(rule.test(value) == false){
          valid = false;
          this.addError(value, _.result(rule, 'message', 'Invalid value'));
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
  },

  fetchIfNeeded: function(){
    if(this.state != 'synced'){
      return this.fetch();
    }
  }
};

var FormViewMixin = {
  template: function(){
    switch(this.model.state){
      case 'error':
        return this.templates['error'];
      case 'loading':
        return this.templates['loading'];
      case 'synced':
      case 'req-fail': // Validation error, show form
      case 'initial':
        return this.templates['normal'];
    }
  },

  renderError: function(msg){
    return msg.join("\n");
  }

  templateHelpers: function(){
    var context = this.prototype.templateHelpers();
    context['error'] = function(field){
      if(this.model.errors[field]){
        return this.renderError(this.model.errors[field]);
      }
    };
    return context;
  }
};

// Validation Rules
var Required = /^.+$/;
Required.message = 'This field is required';

var EmailAddress = /^[^\@]+\@.+\..+$/; // This is as good as it needs to be
EmailAddress.message = 'A valid email address is required';


module.exports = {
  'FormModel': FormModel,

  // Validation rules
  'Required': Required,
  'EmailAddress': EmailAddress
};
