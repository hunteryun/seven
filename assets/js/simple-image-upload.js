/**
 * simple image upload js
 */

$(function(){
  $(".liteupload").liteUploader({
    url: "/admin/safe/upload",
    singleFileUploads: true,
    params: {
      accept: "images",
      multiple: true
    }
  })
  .on("lu:success", function (e, {response}) {
    var varDom = '';
    var res = $.parseJSON(response);
    vartDom = '<div class="item"><img src="'+ res.data.full_path_new_name +'" class="upload-img"><input type="hidden" name="up_photos[][img]" value="'+res.data.full_path_new_name+'"><div class="del-pimg" onClick="delSimpleImg(this)"></div></div>'
    $('#imagePreview').append(vartDom);
  });

  $(".liteupload").change(function () {
    $(this).data("liteUploader").startUpload();
  });
})

function delSimpleImg(e) {
  $(e).parent('div').remove();
}
