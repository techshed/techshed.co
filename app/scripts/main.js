/* jshint camelcase: false */
/* global NProgress, FastClick */

(function() {
  'use strict';

  var el, href, TechShedCo = {
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
        window.techshedco = this;
        TechShedCo = this;
        el = TechShedCo.elements;
        href = location.href.split('/').pop();
        TechShedCo.getPage(href);
        TechShedCo.bindEvents();
        FastClick.attach(document.body);
      },

      bindEvents: function() {

        el.homeVideo.on('play', function() {
          console.log('video is playing');
          $(this).remove();
        });

        // Nav toggle button
        el.navToggle.on('click', function(ev) {
          // Prevent multiple clicks within .4s window
          if (!$(this).data('isClicked')) {
            TechShedCo.toggleNavMenu();
            var link = $(this);
            link.data('isClicked', true);
            setTimeout(function() {
              link.removeData('isClicked');
            }, 400);
          }
          ev.preventDefault();
        });

        // Page links
        el.navPrimaryLink.on('click', function(ev) {
          var $this = $(this),
            page = $this.attr('class').split(' ')[0];
          href = location.href.split('/').pop();

          // Prevent multiple clicks within .4s window
          if (!$this.data('isClicked')) {

            // ~~~~~~ mobile nav logic (need to refactor) ~~~~~~
            if ($this.parents().hasClass('nav-primary__menu')) {
              TechShedCo.toggleNavMenu();
            }
            if ($this.hasClass('logo') && !el.navPrimaryMenu.hasClass('is-hidden')) {
              TechShedCo.toggleNavMenu();
            }
            // check if already on page before fetching
            if (href !== page) {
              TechShedCo.getPage(page);
              history.pushState({}, '', page);
            }

            $this.data('isClicked', true);
            setTimeout(function() {
              $this.removeData('isClicked');
            }, 1000);
          }
          ev.preventDefault();
        });

        // Enable back button via HTML5 pop state
        $(window).on('popstate', function(ev) {
          var href = location.href.split('/').pop();
          TechShedCo.getPage(href);
          console.log(href);
          ev.preventDefault();
        });
      },

      getPage: function(page) {
        // strip special characters
        var cleanPage = page.replace(/[^a-z0-9\s]/gi, '');
        // page html path
        var pageUrl = ('/pages/' + cleanPage + '.html');
        NProgress.start();

        // underline active nav link
        if (cleanPage === 'home' || cleanPage === '') {
          el.navPrimary.removeClass('subpage');
          $('.home').addClass('active').siblings().removeClass('active');
        } else {
          el.navPrimary.addClass('subpage');
          $('.' + cleanPage).addClass('active').siblings().removeClass('active');
        }

        // unload jobscore widget
        if (cleanPage === 'jobs') {
          window._jobscore_loader = false;
        }

        // fade page window, load new page, fade back in
        el.pageWindow.addClass('is-transitioning')
          .on('transitionend webkitTransitionEnd', function(ev) {
            // check if page = home
            if (cleanPage === 'home' || cleanPage === '') {
              el.pageWindow.load('/pages/home.html', function() {
                $('body').removeClass().addClass('home');
                el.pageWindow.removeClass('is-transitioning');
                NProgress.done();
                TechShedCo.fitText();
              });
              // not home, so load the url
            } else {
              el.pageWindow.load(pageUrl, function(response, status) {
                if (status === 'error') {
                  el.pageWindow.load('/pages/404.html');
                }
                $('body').removeClass().addClass(cleanPage + ' subpage');
                el.pageWindow.removeClass('is-transitioning');
                NProgress.done();
              });
            }
            el.pageWindow.off('transitionend webkitTransitionEnd');
            ev.stopPropagation();
          });

        setTimeout(function() {
          TechShedCo.initJobScoreWidget();
        }, 500);
      },

      fitText: function() {
        var winW = $(window).width();

        $('.fit-text').fitText(0.697, {
          minFontSize: '86px'
        });
      },

      toggleNavMenu: function() {
        if (el.navPrimaryMenu.hasClass('is-hidden')) {
          el.pageWindow.addClass('no-scroll');
          el.navPrimary.addClass('nav-primary__menu--on');
          el.navToggle.html('CLOSE <span>×</span>');
          el.navPrimaryMenu.css({
            'display': 'block'
          });
          setTimeout(function() {
            el.navPrimaryMenu.removeClass('is-hidden');
          }, 30);

        } else {
          el.pageWindow.removeClass('no-scroll');
          el.navPrimary.removeClass('nav-primary__menu--on');
          el.navToggle.html('MENU <span>☰</span>');
          el.navPrimaryMenu
            .addClass('is-hidden')
            .one('transitionend webkitTransitionEnd', function(ev) {
              el.navPrimaryMenu.css({
                'display': 'none'
              });
              el.navPrimaryMenu.off('transitionend webkitTransitionEnd');
              ev.stopPropagation();
            });
        }
      },

      // not enabled
      setHeaderHeight: function() {
        var winH = $(window).height() - el.navPrimary.height();
        if (winH < 600) {
          // el.pageHeader.css(
          //   'height', $(window).height()
          // );
        }
      },

      debounce: function(func, timer) {
        var timeoutID;
        return function() {
          var scope = this,
            args = arguments;
          clearTimeout(timeoutID);
          timeoutID = setTimeout(function() {
            func.apply(scope, Array.prototype.slice.call(args));
          }, timer);
        };
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
      }
    };
  TechShedCo.init();
})();
