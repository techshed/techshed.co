'use strict';

$(function() {
  var _, v, e, a, TechshedCo = {
      views: {

      },
      elements: {
        primaryNav: $('.primary-nav'),
        pageHeader: $('.page-content').find('header')
      },
      actions: {

      },
      init: function() {
        _ = this;
        v = _.views;
        e = _.elements;
        a = _.actions;
        _.bindActions();
        _.setHeaderHeight();

        $('.fit-text').fitText(0.72, {
          minFontSize: '85px'
        });

      },
      bindActions: function() {

      },
      imgFadeIn: function() {

      },
      setHeaderHeight: function() {
        var winH = $(window).height() - e.primaryNav.height();

        if (winH < 600) {
          // e.pageHeader.css(
          //   'height', $(window).height()
          // );
        } else {

        }
      },
      revealView: function(el) {
        v.currentView = el;
        el.removeClass().addClass('animated slideInRight');
      },
      concealView: function(el) {
        el.removeClass().addClass('animated slideOutLeft');
      }
    };

  // FastClick.attach(document.body);
  TechshedCo.init();
});
