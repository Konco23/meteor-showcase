Showcase = new Meteor.Collection("showcase");

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Showcase.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Showcase.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5, date: new Date()});
    }
  });
  Accounts.loginServiceConfiguration.insert({
    service: "github",
    clientId: 'cc02855bd41dbfc4be72',
    secret: '443ea5d64be6afada4acd946cf5b49878f4af4c8'
  });

  Meteor.publish("showcase-items", function () {
    return Showcase.find(); // everything
  });
}

if (Meteor.isClient) {
  $('#modal_edit').modal('show').on('shown', function(){
    $('#modal_view').modal('hide');
  });
  Meteor.subscribe("showcase-items");
  //Meteor.startup(function () {
    Session.set('nav_settings', {name: 1, date: -1, score:-1});
    Session.set('sort_by', "date"); // default to sorting by date, descending
    Session.set('filter', '');
  //});
  Template.list.items = function () {
    var nav_config = Session.get('nav_settings');
    var sort_by = Session.get('sort_by');
    var sort_order = {};
    var filter = Session.get('filter');
    if (!filter || filter == undefined){ filter = '' };
    sort_order[sort_by] = nav_config[sort_by] || -1;
    return Showcase.find({ name: { $regex: filter, $options: 'i'}}, {sort: sort_order}).fetch();
  };
  Template.item.selected = function(){
    return Session.equals("selected_item", this._id) ? "selected" : '';
  };
  Template.nav.name_active = function(){
    return Session.equals("sort_by", 'name') ? "active" : '';
  };
  Template.nav.date_active = function(){
    return Session.equals("sort_by", 'date') ? "active" : '';
  };
  Template.nav.score_active = function(){
    return Session.equals("sort_by", 'score') ? "active" : '';
  };
  Template.nav.name_dir = function(){
    return Template.nav.buttonLogo('name', -1);
  };
  Template.nav.date_dir = function(){
    return Template.nav.buttonLogo('date', -1);
  };
  Template.nav.score_dir = function(){
    return Template.nav.buttonLogo('score', -1);
  };
  Template.view.description = function(){
    return Session.get('description');
  };
  Template.edit.description = function(){
    return Session.get('description');
  };
  Template.view.app_name = function(){
    return Session.get('name');
  };
  Template.edit.app_name = function(){
    return Session.get('name');
  };
  Template.view.score = function(){
    return Session.get('score');
  };
  Template.edit.score = function(){
    return Session.get('score');
  };
  Template.view.image_url = function(){
    return Session.get('image_url');
  };
  Template.edit.image_url = function(){
    return Session.get('image_url');
  };
  Template.view.date = function(){
    return Session.get('date');
  };
  Template.view.source_url = function(){
    return Session.get('source_url');
  };
  Template.edit.source_url = function(){
    return Session.get('source_url');
  };
  Template.view.demo_url = function(){
    return Session.get('demo_url');
  };
  Template.edit.demo_url = function(){
    return Session.get('demo_url');
  };
  Template.view.cartridge_deps = function(){
    return Session.get('cartridge_deps');
  };
  Template.edit.cartridge_deps = function(){
    return Session.get('cartridge_deps');
  };
  Template.view.author = function(){
    return Session.get('author');
  };
  Template.edit.author = function(){
    return Session.get('author');
  };
  Template.view.events({
    'click a.edit' : function (){
      $('#modal_edit').modal('show');
      $('#modal_view').modal('hide');
    }
  });
  Template.edit.events({
    'click a.save' : function (){
      $('#modal_edit').modal('hide');
      var validation_passed = true;
      //ask for auth, redirect away?
      //read fields (use jquery)
      //validate data and error back, or

      var form_data = {};
      var image_url = $('.edit .image_url').val() || "";
      var score = Number($('.edit .score').val());
      var author = Session.get('author');
      form_data.name = $('.edit .name').val() || "";
      form_data.description = $('.edit .description').val() || "&nbsp;";
      form_data.score = (isNaN(score)) ? 0 : score;
      form_data.image_url = (image_url.search('http') == 0) ? image_url : "https://www.openshift.com/sites/default/files/redhat_shipment.png";
      form_data.source_url = $('.edit .source_url').val() || "https://github.com/openshift-quickstart";
      form_data.demo_url = $('.edit .demo_url').val() || "";
      form_data.cartridge_deps = $('.edit .cartridge_deps').val() || "";
      form_data.author = author || "anonymous";
      form_data._id = Session.get('selected_item');
      form_data.date = new Date(Session.get('date'));
      console.log("form_data:");
      console.log(form_data);

      //load to 'View' modal
      if(validation_passed){
        //insert new data
        console.log(form_data);

        console.log("Showcase.update("+form_data._id+"," + JSON.stringify(form_data)+");");
        var item = Showcase.update(form_data._id, form_data);
        console.log("selected_item: " + form_data._id)
        console.log(item);
        Session.set("name", form_data.name);
        Session.set("description", form_data.description);
        Session.set("image_url", form_data.image_url);
        Session.set("source_url", form_data.source_url);
        Session.set("demo_url", form_data.demo_url);
        Session.set("score", form_data.score);
        Session.set("cartridge_deps", form_data.cartridge_deps);
        Session.set("author", form_data.author);
      }else{
        //highlight errors
        $('#modal_edit').modal('show');
        return false;
      }
    },
    'click a.delete' : function (){
      //ask for auth, redirect away?
      $('#modal_edit').modal('hide');
      var id = Session.get('selected_item');
      Showcase.remove(id);
      Session.set('selected_item', '');
    }
  });
  Template.submit.events({
    'click .submit' : function (){
      $('#modal_create').modal('hide');
      var form_data = {};
      var validation_passed = true;
      //save everything in localstorage?
      //ask for auth, redirect away?
      var u = Meteor.user();
      //read fields (use jquery)
      //validate data and error back, or
      var score = Number($('.create .score').val());
      var image_url = $('.create .image_url').val();
      if( u && u.profile && u.profile.name){
        form_data.author = u.profile.name;
      }else{
        form_data.author = "anonymous";
      }
      form_data.name = $('.create .name').val() || "";
      form_data.description = $('.create .description').val() || "";
      form_data.score = isNaN(score) ? 0 : score;
      form_data.image_url = (image_url.search('http') == 0) ? image_url : "https://www.openshift.com/sites/default/files/redhat_shipment.png";
      form_data.source_url = $('.create .source_url').val() || "https://github.com/openshift-quickstart";
      form_data.demo_url = $('.create .demo_url').val() || "/";
      form_data.cartridge_deps = $('.create .cartridge_deps').val() || "";
      form_data.date = new Date();

      //load to 'View' modal
      if(validation_passed){
        //insert new data
        console.log(form_data);
        var id = Showcase.insert(form_data, function(err, id){
          Session.set("selected_item", id);
          Session.set("name", form_data.name);
          Session.set("description", form_data.description);
          Session.set("image_url", form_data.image_url);
          Session.set("source_url", form_data.source_url);
          Session.set("demo_url", form_data.demo_url);
          Session.set("date", form_data.date);
          Session.set("score", form_data.score);
          Session.set("cartridge_deps", form_data.cartridge_deps);
          Session.set("author", form_data.author);

          $('#modal_view').modal('show');
        });
      }else{
        //highlight errors
        $('#modal_create').modal('show');
        return false;
      }
    }
  });
  Template.nav.events({
    'click #date_sort' : function (){
      Template.nav.toggleNav('date');
    },
    'click #score_sort' : function (){
      Template.nav.toggleNav('score');
    },
    'click #name_sort' : function (){
      Template.nav.toggleNav('name');
    },
    'click #logout_btn' : function () {
      Meteor.logout();
    },
    'click #login_btn' : function () {
      Meteor.loginWithGithub({
          requestPermissions: ['user:email']
        }, function (err) {
        if (err)
          Session.set('errorMessage', err.reason || 'Unknown error');
      });
    }
  });
  Template.item.events({
    'click a.inc': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: 5}});
    },
    'click a.dec': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: -5}});
    },
    'dblclick': function () {
      $('#modal_view').modal('show');
    },   
    'click a.view': function () {
      console.log('not opening popup');
      //$('#modal_view').modal('show');
    },   
    'click': function () {
      var item = Showcase.findOne({_id: this._id});
      Session.set("selected_item", this._id);
      console.log("selected_item: " + this._id)
      console.log(item);
      Session.set("name", (item.name) ? item.name : "App Name");
      Session.set("description", (item.description) ? item.description : "foobar");
      Session.set("image_url", item.image_url || "");
      Session.set("source_url", item.source_url|| "");
      Session.set("demo_url", item.demo_url || "");
      Session.set("date", item.date || "");
      Session.set("score", item.score || "");
      Session.set("cartridge_deps", item.cartridge_deps || "");
      Session.set("author", item.author || "");
    }   
  }); 
  Template.nav.username = function () {
    var u = Meteor.user();
    return u && u.profile && u.profile.name;
  };
  Template.nav.buttonLogo = function (nav_button, direction) {
    var nav_controls = Session.get('nav_settings');
    if(nav_controls[nav_button] * direction == -1 ){
      return 'icon-chevron-up';
    }else{
      return 'icon-chevron-down';
    }
  };
  Template.nav.toggleNav = function (nav_sort) {
    var sort_by = Session.get('sort_by');
    if( nav_sort !== sort_by){
      // set the nav tab
      Session.set('sort_by', nav_sort);
    }else{
      // or, flip the sort order
      var nav_config = Session.get('nav_settings');
      nav_config[sort_by] = nav_config[sort_by] * -1;
      Session.set('nav_settings', nav_config);
    }
  };
}
