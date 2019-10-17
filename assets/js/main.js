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
  $(".dropbutton-toggle").click(function(){
    $(this).closest('.dropbutton-wrapper').toggleClass('open');
  });
  $(".dropbutton-wrapper").mouseleave(function(){
    if($(this).hasClass('open')) {
      $(this).toggleClass('open');
    }
  });

  $(".con").eq(0).show();
  $(".tab-title span").click(function(){
      var num =$(".tab-title span").index(this);
      $(".con").hide();
      $(".con").eq(num).show();
      $(this).attr("class","active spanList");
      $(this).siblings().attr("class","spanList");
  })
})
