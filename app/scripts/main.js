/* jshint camelcase: false */
/* global NProgress, FastClick */

(function() {
  'use strict';

  var el, href, timer, TechshedCo = {

    globalElements: {
      // Nav
      $navPrimary: $('.nav-primary'),
      $navToggle: $('.nav-primary__menu-toggle'),
      $navPrimaryMenu: $('.nav-primary__menu'),
      $navPrimaryMenuLg: $('.nav-primary__menu--lg'),
      $navPrimaryLink: $('.nav-primary__link'),
      $pageWindow: $('#page-window'),
      $pageFooter: $('#page-footer'),
      $scrollToTop: $('.scroll-to-top')
    },

    init: function() {
      console.log('init site');
      window.TechshedCo = this;
      TechshedCo = this;
      el = TechshedCo.globalElements;
      href = location.href.split('/').pop();
      FastClick.attach(document.body);
      NProgress.configure({
        trickleRate: 0.01,
        trickleSpeed: 100,
        minimum: 0.7
      });

      TechshedCo.getPage(href);

      // Enable back button via HTML5 pop state
      $(window).on('popstate', function(ev) {
        ev.preventDefault();
        console.log('popstate init');
        console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
        TechshedCo.getPage(href);
      });
    },

    bindEvents: function() {

      // mobile primary nav toggle
      el.$navToggle.on('click', function(ev) {
        ev.preventDefault();

        // Prevent multiple clicks within .4s window
        if (!$(this).data('isClicked')) {
          TechshedCo.toggleNavMenu();
          var link = $(this);
          link.data('isClicked', true);
          setTimeout(function() {
            link.removeData('isClicked');
          }, 400);
        }
      });

      // primary nav links
      el.$navPrimaryLink.on('click', function(ev) {
        ev.preventDefault();

        var $this = $(this),
          page = $this.attr('class').split(' ')[0];
        href = window.location.href.split('/').pop();

        // ~~~~~~ mobile nav logic (need to refactor) ~~~~~~
        if ($this.parents().hasClass('nav-primary__menu')) {
          TechshedCo.toggleNavMenu();
        }
        // hide mobile nav menu if logo is clicked
        if ($this.hasClass('logo') && !el.$navPrimaryMenu.hasClass('is-hidden')) {
          TechshedCo.toggleNavMenu();
        }
        // check if already on the requested page
        if (href !== page) {
          history.pushState(null, null, '/' + page);

          // scroll to the top of the page before loading new page
          $.smoothScroll({
            scrollTarget: '0',
            afterScroll: function() {
              TechshedCo.getPage(page);
            }
          });
        }

      });

      el.$scrollToTop.on('click', function(ev) {
        ev.preventDefault();
        $.smoothScroll({
          scrollTarget: '0'
        });

      });

      // disable all transitions when window is being resized
      $(window).on('resize', TechshedCo.debounce(function() {
        clearInterval(timer);
        $('.scroll-down-arrow').addClass('hidden');
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

      $('.page-footer').addClass('hidden');

      // underline active nav link
      if (pageTitle === 'home' || pageTitle === '') {
        el.$navPrimary.removeClass('subpage');
        $('.home').addClass('active').siblings().removeClass('active');
      } else {
        el.$navPrimary.addClass('subpage');
        $('.' + pageTitle).addClass('active').siblings().removeClass('active');
      }

      // if jobs page, load the jobscore widget
      if (pageTitle === 'jobs') {
        window._jobscore_loader = false;
        setTimeout(function() {
          TechshedCo.initJobScoreWidget();
        }, 800);
      }

      // fade page window, load new page, fade back in
      el.$pageWindow
        .addClass('is-transitioning')
        .one('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(ev) {
          // check if page = home
          if (pageTitle === 'home' || pageTitle === '') {
            console.log('getpage: home');
            el.$pageWindow.load('/pages/home.html', function() {
              console.log('loadpage: home');
              TechshedCo.showPage(pageTitle);
              NProgress.done();
            });
            // not home, so load the url
          } else {
            console.log('getpage: ' + page);
            el.$pageWindow.load(pageUrl, function(response, status) {
              console.log('loadpage: ' + page);
              if (status === 'error') {
                el.$pageWindow.load('/pages/404.html');
              }
              TechshedCo.showPage(pageTitle);
              NProgress.done();
            });
          }
          el.$pageWindow.off('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd');
          ev.stopPropagation();
        });
    },

    showPage: function(pageTitle) {

      el.$pageWindow.removeClass('is-transitioning');
      TechshedCo.bindEvents();
      TechshedCo.setWaypoints();
      $('.page-footer').removeClass('hidden');
      $('#page-window p, h2, h3, h4').unorphanize(1);

      // init home
      if (pageTitle === 'home' || pageTitle === '') {
        console.log('showPage: home');
        $('body').removeClass().addClass('home');
        TechshedCo.fitText();
        TechshedCo.setHeaderHeight();

        // after video starts playing, remove the poster to avoid flicker on loop
        var $homeVideo = $('.video-bg');
        $homeVideo.on('playing', function() {
          $(this).attr('poster', '');
        });

        // init subpage
      } else {
        console.log('showPage: ' + pageTitle);
        $('body').removeClass().addClass(pageTitle + ' subpage');
      }
      // prevent pageWindow collapsing to 0 height
      $('.page-window').css({
        'min-height': $('.page-window').height()
      });
    },

    fitText: function() {
      $('.fit-text').fitText(0.697, {
        minFontSize: '84px'
      });
    },

    toggleNavMenu: function() {
      if (el.$navPrimaryMenu.hasClass('is-hidden')) {
        $('.page-footer').css({
          'display': 'none'
        });
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
        $('.page-footer').css({
          'display': 'block'
        });
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

    setHeaderHeight: function() {
      var winHeight = $(window).height(),
        pageHeader = $('.page-header'),
        downArrow = $('.scroll-down-arrow');

      // if (pageHeader.height() > winHeight && winHeight > 900) {
      //   console.log('header is taller than window');
      //   pageHeader.css(
      //     'max-height', winHeight
      //   );
      // }

      // 'scroll down' arrow
      setTimeout(function() {
        if (downArrow.hasClass('hidden') && pageHeader.height() > winHeight && $(window).scrollTop() <= 1) {
          downArrow.removeClass('hidden');
        }
      }, 7000);
    },

    setWaypoints: function() {
      $.waypoints('below');

      $('.dormant').waypoint(function() {
        var $this = $(this);
        if ($this.hasClass('dormant')) {
          $(this).waypoint('disable').removeClass('dormant');
        }
      }, {
        offset: '60%'
      });
      $('.scroll-down-arrow').waypoint(function() {
        var $this = $(this);
        $this.waypoint('disable').addClass('hidden');
      }, {
        offset: '80%'
      });
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
