'use strict';

$(function() {
  var _, e, TechShedCo = {
      elements: {
        // Navigation
        navPrimary: $('.nav-primary'),
        navToggle: $('.nav-toggle'),
        navPrimaryMenu: $('.nav-primary__menu'),
        navPrimaryMenuLg: $('.nav-primary__menu--lg'),
        navPrimaryLink: $('.nav-primary__link'),
        // Content Containers
        pageWindow: $('#page-window'),
        pageHeader: $('.page-header')
      },
      init: function() {
        _ = this;
        e = _.elements;
        var href = location.href.split('/').pop();
        _.getPage(href);
        _.bindEvents();
        _.setHeaderHeight();
      },
      bindEvents: function() {
        // nav toggle button
        e.navToggle.on('click', function(el) {
          // prevent multiple clicks within .4s window
          if (!$(this).data('isClicked')) {
            _.toggleNavMenu();
            var link = $(this);
            link.data('isClicked', true);
            setTimeout(function() {
              link.removeData('isClicked');
            }, 400);
          }
          el.preventDefault();
        });

        // nav links
        e.navPrimaryLink.on('click', function(el) {
          var $this = $(this),
            page = $this.data('page');

          // ## need to simplify this ##
          if ($(this).parents().hasClass('nav-primary__menu')) {
            _.toggleNavMenu();
          }
          if ($(this).hasClass('logo') && !e.navPrimaryMenu.hasClass('is-hidden')) {
            _.toggleNavMenu();
          }
          var href = location.href.split('/').pop();
          if (href !== page) {
            _.getPage(page);
            history.pushState({}, '', page);
          }
          el.preventDefault();
        });

        // back button / HTML5 pop state
        $(window).on('popstate', function(el) {
          var href = location.href.split('/').pop();
          _.getPage(href);
          console.log(href);
          el.preventDefault();
        });
      },
      getPage: function(page) {
        // page html path
        var url = '/pages/' + page + '/index.html';

        // if home was clicked
        if (page === 'home' || page === '') {
          e.pageWindow.load('/pages/home/index.html', function() {
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
        $('.fit-text').fitText(0.7, {
          minFontSize: '85px'
        });
      },
      toggleNavMenu: function() {
        if (e.navPrimaryMenu.hasClass('is-hidden')) {
          e.pageWindow.addClass('no-scroll');
          e.navPrimaryMenu.css({
            'display': 'block'
          });
          setTimeout(function() {
            e.navPrimaryMenu.removeClass('is-hidden');
          }, 100);

        } else {
          e.pageWindow.removeClass('no-scroll');
          e.navPrimaryMenu
            .addClass('is-hidden')
            .one('transitionend webkitTransitionEnd', function(el) {
              e.navPrimaryMenu.css({
                'display': 'none'
              });
              e.navPrimaryMenu.off('transitionend webkitTransitionEnd');
              el.stopPropagation();
            });
        }
      },
      setHeaderHeight: function() {
        var winH = $(window).height() - e.navPrimary.height();
        if (winH < 600) {
          // e.pageHeader.css(
          //   'height', $(window).height()
          // );
        }
      }
    };

  FastClick.attach(document.body);
  TechShedCo.init();
});
