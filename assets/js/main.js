/**
 * main js
 */

$(function(){
  $("#admin-bar ul li").mouseenter(function(){
    $(this).children('ul').parents('ul').addBack().addClass('expanded').siblings('a, span').addClass('expanded-trail');
  });
  $("#admin-bar ul li").mouseleave(function(){
    var $uls = $(this).find('> ul');
    var $link = $(this).find('> a, > span');
    this.sfTimer = setTimeout(function () {
      $uls.removeClass('expanded');
      $link.removeClass('expanded-trail');
    }, 400);
  });
})
