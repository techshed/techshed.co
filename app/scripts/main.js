'use strict';

$(function() {
  var _, e, TechShedCo = {
      elements: {
        navToggle: $('.nav-toggle'),
        pageWindow: $('#page-window'),
        navPrimary: $('.nav-primary'),
        navPrimaryLinks: $('.nav-primary__links'),
        navPrimaryLinksLg: $('.nav-primary__links--lg'),
        navPrimaryLink: $('.nav-primary__link'),
        pageHeader: $('.page-header')
      },

      init: function() {
        _ = this;
        e = _.elements;
        var href = location.href.split('/').pop();
        _.getPage(href);
        _.bindTriggers();
        _.setHeaderHeight();
      },

      bindTriggers: function() {

        e.navToggle.on('click', function(el) {
          e.navPrimaryLinks.toggleClass('show');
          el.preventDefault();
        });

        e.navPrimaryLink.on('click', function(el) {
          var $this = $(this),
            page = $this.data('page');

          e.navPrimaryLinks.removeClass('show');
          var href = location.href.split('/').pop();
          if (href !== page) {
            _.getPage(page);
            history.pushState({}, '', page);
          }
          el.preventDefault();
        });

        $(window).on('popstate', function(el) {
          var href = location.href.split('/').pop();
          _.getPage(href);
          console.log(href);
          el.preventDefault();
        });
      },

      getPage: function(page) {
        var url = '/pages/' + page + '.html';

        if (page === 'home' || page === '') {
          e.pageWindow.load('/pages/home.html', function() {
            $('body').removeClass().addClass('home');
            _.fitText();
          });
        } else {
          e.pageWindow.load(url, function() {
            $('body').removeClass().addClass(page + ' subpage');
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

  FastClick.attach(document.body);
  TechShedCo.init();
});
