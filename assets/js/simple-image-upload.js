/**
 * simple image upload js
 */
function simpleUploader(id) {
  $('#'+id+'Upload').liteUploader({
    url: "/admin/safe/upload",
    singleFileUploads: true,
    params: {
      accept: "images",
      multiple: true
    }
  })
  .on("lu:success", function (e, {response}) {
    if($('#'+id+'SimpleUploader').find("#single-img").length > 0) {
      var varDom = '';
      var res = $.parseJSON(response);
      vartDom = '<div class="item"><img src="'+ res.data.full_path_new_name +'" class="upload-img"></div>'
      $('#'+id+'SimpleUploader').find('#imagePreview').html(vartDom);
      $('#'+id+'SimpleUploader').find("#single-img").val(res.data.full_path_new_name);
    }else {
      var varDom = '';
      var res = $.parseJSON(response);
      vartDom = '<div class="item"><img src="'+ res.data.full_path_new_name +'" class="upload-img"><input type="hidden" name="up_photos[][img]" value="'+res.data.full_path_new_name+'"><div class="del-pimg" onClick="delSimpleImg(this)"></div></div>'
      $('#'+id+'SimpleUploader').find('#imagePreview').append(vartDom);
    }
  });

  $('#'+id+'Upload').change(function () {
    $(this).data("liteUploader").startUpload();
  });
}

function delSimpleImg(e) {
  $(e).parent('div').remove();
}
