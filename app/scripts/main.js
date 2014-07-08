/* jshint camelcase: false */
/* global NProgress, FastClick */

(function() {
  'use strict';

  var el, href, timer, TechshedCo = {
      elements: {
        // Nav
        $navPrimary: $('.nav-primary'),
        $navToggle: $('.nav-primary__menu-toggle'),
        $navPrimaryMenu: $('.nav-primary__menu'),
        $navPrimaryMenuLg: $('.nav-primary__menu--lg'),
        $navPrimaryLink: $('.nav-primary__link'),
        // Containers
        $pageWindow: $('#page-window'),
        $pageHeader: $('.page-header'),
        // Page Elements
        $homeVideo: $('.video-bg'),
        $homeHeadline: $('.home .page-header h1')
      },

      init: function() {
        window.TechshedCo = this;
        TechshedCo = this;
        el = TechshedCo.elements;
        href = location.href.split('/').pop();
        FastClick.attach(document.body);
        TechshedCo.getPage(href);
        TechshedCo.bindEvents();
      },

      bindEvents: function() {

        // Nav toggle button
        el.$navToggle.on('click', function(ev) {
          // Prevent multiple clicks within .4s window
          if (!$(this).data('isClicked')) {
            TechshedCo.toggleNavMenu();
            var link = $(this);
            link.data('isClicked', true);
            setTimeout(function() {
              link.removeData('isClicked');
            }, 400);
          }
          ev.preventDefault();
        });

        // Page links
        el.$navPrimaryLink.on('click', function(ev) {
          var $this = $(this),
            page = $this.attr('class').split(' ')[0];
          href = location.href.split('/').pop();

          // Prevent multiple clicks within .4s window
          if (!$this.data('isClicked')) {

            // ~~~~~~ mobile nav logic (need to refactor) ~~~~~~
            if ($this.parents().hasClass('nav-primary__menu')) {
              TechshedCo.toggleNavMenu();
            }
            if ($this.hasClass('logo') && !el.$navPrimaryMenu.hasClass('is-hidden')) {
              TechshedCo.toggleNavMenu();
            }
            // check if already on page before fetching
            if (href !== page) {
              TechshedCo.getPage(page);
              history.pushState({}, '', page);
            }

            $this.data('isClicked', true);
            setTimeout(function() {
              $this.removeData('isClicked');
            }, 2000);
          }
          ev.preventDefault();
        });

        // Enable back button via HTML5 pop state
        $(window).on('popstate', function(ev) {
          var href = location.href.split('/').pop();
          TechshedCo.getPage(href);
          console.log(href);
          ev.preventDefault();
        });

        // disable all transitions when window is being resized
        $(window).on('resize', TechshedCo.debounce(function() {
          clearInterval(timer);
          $('body').addClass('no-transitions');
          timer = setTimeout(function() {
            $('body').removeClass('no-transitions');
          }, 1000);
        }, 0));
      },

      getPage: function(page) {
        // strip special characters
        var pageTitle = page.replace(/[^a-z0-9\s]/gi, '');
        // page html path
        var pageUrl = ('/pages/' + pageTitle + '.html');
        NProgress.start();

        // underline active nav link
        if (pageTitle === 'home' || pageTitle === '') {
          el.$navPrimary.removeClass('subpage');
          $('.home').addClass('active').siblings().removeClass('active');
        } else {
          el.$navPrimary.addClass('subpage');
          $('.' + pageTitle).addClass('active').siblings().removeClass('active');
        }

        // unload jobscore widget
        if (pageTitle === 'jobs') {
          window._jobscore_loader = false;
          setTimeout(function() {
            TechshedCo.initJobScoreWidget();
          }, 1000);
        }

        // fade page window, load new page, fade back in
        el.$pageWindow.addClass('is-transitioning')
          .one('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(ev) {
            // check if page = home
            if (pageTitle === 'home' || pageTitle === '') {
              el.$pageWindow.load('/pages/home.html', function() {
                TechshedCo.initPage(pageTitle);
              });
              // not home, so load the url
            } else {
              el.$pageWindow.load(pageUrl, function(response, status) {
                if (status === 'error') {
                  el.$pageWindow.load('/pages/404.html');
                }
                TechshedCo.initPage(pageTitle);
              });
            }
            el.$pageWindow.off('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd');
            ev.stopPropagation();
          });
      },

      initPage: function(pageTitle) {
        NProgress.done();
        el.$pageWindow.removeClass('is-transitioning');
        TechshedCo.setWaypoints();
        $('p, h2, h3, h4').unorphanize(1);

        // home init
        if (pageTitle === 'home' || pageTitle === '') {
          $('body').removeClass().addClass('home');
          TechshedCo.fitText();

          // after video starts playing, remove the poster to avoid flicker on loop
          var $homeVideo = $('.video-bg');
          $homeVideo.on('timeupdate', function() {
            $(this).attr('poster', '');
          });

          // subpage init
        } else {
          $('body').removeClass().addClass(pageTitle + ' subpage');
        }
      },

      fitText: function() {
        $('.fit-text').fitText(0.697, {
          minFontSize: '84px'
        });
      },

      toggleNavMenu: function() {
        if (el.$navPrimaryMenu.hasClass('is-hidden')) {
          el.$pageWindow.addClass('no-scroll');
          el.$navPrimary.addClass('nav-primary__menu--on');
          el.$navToggle.html('CLOSE <span>×</span>');
          el.$navPrimaryMenu.css({
            'display': 'block'
          });
          setTimeout(function() {
            el.$navPrimaryMenu.removeClass('is-hidden');
          }, 30);

        } else {
          el.$pageWindow.removeClass('no-scroll');
          el.$navPrimary.removeClass('nav-primary__menu--on');
          el.$navToggle.html('MENU <span>☰</span>');
          el.$navPrimaryMenu
            .addClass('is-hidden')
            .one('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(ev) {
              el.$navPrimaryMenu.css({
                'display': 'none'
              });
              el.$navPrimaryMenu.off('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd');
              ev.stopPropagation();
            });
        }
      },

      // not enabled
      setHeaderHeight: function() {
        var winH = $(window).height() - el.$navPrimary.height();
        if (winH < 600) {
          // el.$pageHeader.css(
          //   'height', $(window).height()
          // );
        }
      },

      setWaypoints: function() {
        $('.dormant').waypoint(function() {
          var $this = $(this);
          if ($this.hasClass('dormant')) {
            $(this).waypoint('disable').removeClass('dormant');
          }
        }, {
          offset: '70%'
        });
        $.waypoints('below');
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
      }
    };
  TechshedCo.init();
})();
