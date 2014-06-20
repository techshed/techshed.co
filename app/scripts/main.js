'use strict';

FastClick.attach(document.body);

$(function() {
  var _, e, href, TechShedCo = {
      elements: {
        // Nav
        navPrimary: $('.nav-primary'),
        navToggle: $('.nav-primary__menu-toggle'),
        navPrimaryMenu: $('.nav-primary__menu'),
        navPrimaryMenuLg: $('.nav-primary__menu--lg'),
        navPrimaryLink: $('.nav-primary__link'),
        // Containers
        pageWindow: $('#page-window'),
        pageHeader: $('.page-header'),
        // Page Elements
        homeVideo: $('.video-bg'),
        homeHeadline: $('.home .page-header h1')
      },
      init: function() {
        _ = this;
        e = _.elements;
        href = location.href.split('/').pop();
        _.getPage(href);
        _.bindEvents();
        _.setHeaderHeight();
      },
      bindEvents: function() {
        // Nav toggle button
        e.navToggle.on('click', function(el) {
          // Prevent multiple clicks within .4s window
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

        // Page links
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

        // Enable back button via HTML5 pop state
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
        NProgress.start();

        // unload jobscore widget
        window._jobscore_loader = false;

        // if home was clicked
        if (page === 'home' || page === '') {
          e.pageWindow.load('/pages/home/index.html', function() {
            $('body').removeClass().addClass('home');
            _.fitText();
            NProgress.done();
          });
        } else {
          e.pageWindow.load(url, function() {
            $('body').removeClass().addClass(page + ' subpage');
            NProgress.done();
          });
        }
        setTimeout(function() {
          _.initJobScoreWidget();
        }, 500);
      },
      fitText: function() {
        $('.fit-text').fitText(0.697, {
          minFontSize: '78px'
        });
      },
      toggleNavMenu: function() {
        if (e.navPrimaryMenu.hasClass('is-hidden')) {
          e.pageWindow.addClass('no-scroll');
          e.navPrimary.addClass('nav-primary__menu--on');
          e.navToggle.html('CLOSE <span>×</span>');
          e.navPrimaryMenu.css({
            'display': 'block'
          });
          setTimeout(function() {
            e.navPrimaryMenu.removeClass('is-hidden');
          }, 30);

        } else {
          e.pageWindow.removeClass('no-scroll');
          e.navPrimary.removeClass('nav-primary__menu--on');
          e.navToggle.html('MENU <span>☰</span>');
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
      },
      initJobScoreWidget: function() {
        (function(d, s, c) {
          if (window._jobscore_loader) {
            return;
          } else {
            window._jobscore_loader = true;
          }
          var o = d.createElement(s);
          o.type = 'text/javascript';
          o.async = true;
          var sc = d.getElementsByTagName(s)[0];
          sc.parentNode.insertBefore(o, sc);
          o.src = ('https:' === d.location.protocol ? 'https:' : 'http:') + '//www.jobscore.com/jobs/' + c + '/widget.js';
        })(document, 'script', 'redbeacon');
      },
      concealPageWindow: function() {
        e.pageWindow.fadeOut(400, function() {
          console.log('animation end');
        });
      },
      revealPageWindow: function() {
        e.pageWindow.fadeIn();
      }
    };
  TechShedCo.init();
})();
