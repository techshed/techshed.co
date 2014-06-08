'use strict';

$(function() {
  var _, e, TechShedCo = {
      elements: {
        pageWindow: $('#page-window'),
        navPrimary: $('.nav-primary'),
        navPrimaryLink: $('.nav-primary__link'),
        pageHeader: $('.page-header')
      },

      init: function() {
        _ = this;
        e = _.elements;
        _.bindActions();
        _.setHeaderHeight();
        _.fitText();

        _.getPage('home');
      },

      bindActions: function() {
        e.navPrimaryLink.on('click', function(e) {
          var page = $(this).data('page');
          _.getPage(page);
          history.pushState({}, '', page);
          e.preventDefault();
        });

        $(window).on('popstate', function(e) {
          var href = location.href.split('/').pop();
          _.getPage(href);
          console.log(href);
          e.preventDefault();
        });
      },

      getPage: function(page) {
        var url = '/pages/' + page + '.html';

        if (page === 'home' || page === ''){
          console.log('home!!!!');
          e.pageWindow.load('/pages/home.html', function(){
            $('body').removeClass().addClass('home');
            _.fitText();
          });
        } else{
          e.pageWindow.load(url, function() {
            $('body').removeClass().addClass(page);
          });
        }
        
      },

      fitText: function() {
        $('.fit-text').fitText(0.72, {
          minFontSize: '85px'
        });
      },

      setHeaderHeight: function() {
        var winH = $(window).height() - e.navPrimary.height();

        if (winH < 600) {
          // e.pageHeader.css(
          //   'height', $(window).height()
          // );
        } else {

        }
      },

    };

  // FastClick.attach(document.body);
  TechShedCo.init();
});
