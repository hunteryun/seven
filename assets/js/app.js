/**
 * vue app
 */
Vue.http.options.emulateJSON = true;

var App = new Vue({
  el: '#App',
  data: {
    view_name: 'default',
    view_machine_name: 'default',
    view_title: '',
    view_description: '',
    view_table: '',
    view_fields: [],
    view_filters: [],
    view_sorts: [],
    view_relations: [],
    view_pager: {
      type: 'display_all',
      display: 10,
      offset: 0
    },
    view_path: '',
    view_permissions: [],
    settings: [],
    has_pager: false,
    has_exposed_sort: false,
    tables: [],
    templates: [],
    template_content: '',
    fields: {},
    preview_result: '',
    show_editor: true,
    temp_template: '',
    relationships: [],
    filters_list: [],
    filter_ops: [],
    filter_value_placeholder: '',
    new_filter_field: '',
    new_filter_op: 'equals',
    new_filter_value: '',
    new_filter_value_from_url: false,
    new_filter_exposed_setting: false,
    new_filter_exposed_lable: '',
    new_filter_exposed_description: '',
    new_filter_exposed_identifier: '',
    new_sort_field: '',
    new_sort_value: 'asc',
    new_sort_date: 'second',
    new_sort_exposed_setting: false,
    new_sort_exposed_lable: '',
    new_view_table_field: '',
    new_view_relation_table: '',
    new_view_relation_table_field: '',
    select_field_filter_type: '',
    select_field_filter_value: [],
    select_field_sort_type: '',
    editedFilter: null,
    editedSort: null,
    editedRelation: null,
    edit_filter_mode: false,
    edit_sort_mode: false,
    edit_relation_mode: false,
    edit_machine_name: false,
    add_relationships: false,
    json_export: false,
    need_permission: false,
    permissions: [],
    context_filter_value: '',
    black_relation_tables: [],
    filter_value_options: []
  },
  mounted: function () {
    this.initViewsSetting();
    this.initTablesList();
    this.initFilterOpList();
    this.initTemplatesList();
    if(typeof(edit_view) !== 'undefined'){
      this.initDefaultValue();
    }
  },
  computed: {
    canPreview: function () {
      return (!this.json_export || this.view_fields.length == 0) && this.template_content == '';
    }
  },
  watch: {
    view_name: function (newName) {
      this.getMachineName();
    },
    new_filter_op: function (newFilterOp) {
      if(newFilterOp == 'between' || newFilterOp == 'notBetween') {
        this.filter_value_placeholder = '格式为：1-10';
      }else if(newFilterOp == 'in' || newFilterOp == 'notIn') {
        this.filter_value_placeholder = '用逗号(,)分隔';
      }else {
        this.filter_value_placeholder = '请填写值';
      }
    },
    new_filter_value_from_url: function (newValue) {
     var vm = this;
     if(newValue){
       this.setFilterValue(vm.new_filter_field+':::fromUrl');
     }else {
       this.setFilterValue('');
     }
   }
  },
  methods: {
    initDefaultValue: function() {
      var vm = this;
      vm.view_name = edit_view.view_name;
      vm.view_machine_name = edit_view.view_machine_name;
      vm.view_title = edit_view.view_title;
      vm.view_description = edit_view.view_description;
      vm.view_table = edit_view.view_table;
      vm.view_fields = edit_view.view_fields;
      vm.has_pager = edit_view.has_pager === 'false' ? false : true;
      vm.has_exposed_sort = edit_view.has_exposed_sort === 'false' ? false : true;
      vm.view_pager = edit_view.view_pager;
      vm.template_content = edit_view.template_content;
      vm.json_export = edit_view.json_export === 'false' ? false : true;
      vm.view_path = edit_view.view_path;
      if(edit_view.view_relations){
        vm.view_relations = edit_view.view_relations;
        vm.add_relationships = true;
      }
      if(edit_view.view_filters){
        vm.view_filters = edit_view.view_filters;
      }
      if(edit_view.view_sorts){
        vm.view_sorts = edit_view.view_sorts;
      }
    },
    initViewsSetting: function() {
      var vm = this;
      vm.$http.get('/admin/api/views/setting').then(function (response) {
          if (response.body.length == 0) {
            layer.alert('init error！', {icon: 5});
          } else {
            vm.settings = response.body;
          }
      }, function (response) {
          layer.alert('init error！', {icon: 5});
      });
    },
    initTablesList: function() {
      var vm = this;
      vm.$http.get('/admin/api/tables').then(function (response) {
          if (response.body.length == 0) {
            layer.alert('init error！', {icon: 5});
          } else {
            vm.tables = response.body;
            if(typeof(edit_view) !== 'undefined'){
              vm.updateField();
              if(edit_view.view_relations){
                for(let i = 0, len = edit_view.view_relations.length; i < len; i++) {
                  vm.new_view_table_field = edit_view.view_relations[i].view_table_field;
                  vm.new_view_relation_table = edit_view.view_relations[i].view_relation_table;
                  vm.new_view_relation_table_field = edit_view.view_relations[i].view_relation_table_field;
                  vm.addRelationshipFields();
                }
              }
            }
          }
      }, function (response) {
          layer.alert('init error！', {icon: 5});
      });
    },
    initFilterOpList: function() {
      var vm = this;
      vm.$http.get('/admin/api/filter-ops').then(function (response) {
        if (response.body.length == 0) {
          layer.alert('init error！', {icon: 5});
        } else {
          vm.filters_list = response.body;
        }
      }, function (response) {
        layer.alert('init error！', {icon: 5});
      });
  	},
    initTemplatesList: function() {
      var vm = this;
      vm.$http.post('/admin/api/templates').then(function (response) {
        if (response.body.length != 0) {
          vm.templates = response.body;
        }
      }, function (response) {
        layer.alert('init error！', {icon: 5});
      });
  	},
    getMachineName: _.debounce(
      function () {
        var vm = this;
        vm.$http.post('/admin/api/machine-name', {name:vm.view_name}).then(function (response) {
          if (response.body.length != 0) {
            vm.view_machine_name = response.body;
          }
        }, function (response) {
          layer.alert('create error！', {icon: 5});
        });
      },
      // 这是我们为判定用户停止输入等待的毫秒数
      1000
    ),
    editMachineName: function(){
      var vm = this;
      vm.edit_machine_name = !vm.edit_machine_name;
    },
    addRelationships: function(){
      var vm = this;
      vm.add_relationships = !vm.add_relationships;
    },
    setFilterValue: function(value) {
      var vm = this;
      vm.new_filter_value = value;
    },
    addNewFilter: function(exposed) {
      var vm = this;
      if(!exposed){
        if(vm.new_filter_op == 'isNull' || vm.new_filter_op == 'isNotNull') {
          var value = true;
        }else {
          var value = vm.new_filter_value && vm.new_filter_value.trim();
        }

        if (vm.new_filter_field == '' || vm.new_filter_op == '' || !value) {
          layer.alert('Please select the filter field！', {icon: 5});
          return;
        }
      }
      vm.view_filters.push({
        field: vm.new_filter_field,
        op: vm.new_filter_op,
        value: vm.new_filter_value.trim(),
        lable: vm.filter_ops[vm.new_filter_op].lable,
        exposed: exposed ? exposed : false,
        exposed_setting: {
          lable: vm.new_filter_exposed_lable,
          description: vm.new_filter_exposed_description,
          identifier: vm.new_filter_exposed_identifier
        }
      });
      vm.new_filter_value_from_url = false;
      vm.new_filter_exposed_setting = false;
    },
    editFilter: function (filter) {
      var vm = this;
      vm.new_filter_field = filter.field;
      vm.new_filter_op = filter.op;
      vm.new_filter_value = filter.value;
      vm.new_filter_exposed_setting = filter.exposed;
      vm.new_filter_exposed_lable = filter.exposed_setting.lable;
      vm.new_filter_exposed_description = filter.exposed_setting.description;
      vm.new_filter_exposed_identifier = filter.exposed_setting.identifier;
      vm.editedFilter = filter;
      vm.edit_filter_mode = true;
      if(vm.filter_ops.length == 0){
        vm.updateFilterOp();
      }
    },
    doneEditFilter: function (exposed) {
      var vm = this;
      if(!exposed){
        if(vm.new_filter_op == 'isNull' || vm.new_filter_op == 'isNotNull') {
          var value = true;
        }else {
          var value = vm.new_filter_value && vm.new_filter_value.trim();
        }

        if (!value) {
          layer.alert('Please set the filter value', {icon: 5});
          return;
        }
      }
      vm.view_filters.splice(vm.view_filters.indexOf(vm.editedFilter), 1, {
        field: vm.new_filter_field,
        op: vm.new_filter_op,
        value: vm.new_filter_value.trim(),
        lable: vm.filter_ops[vm.new_filter_op].lable,
        exposed: exposed ? exposed : false,
        exposed_setting: {
          lable: vm.new_filter_exposed_lable,
          description: vm.new_filter_exposed_description,
          identifier: vm.new_filter_exposed_identifier
        }
      });
      vm.edit_filter_mode = false;
      vm.new_filter_value_from_url = false;
      vm.new_filter_exposed_setting = false;
    },
    cancelEditFilter: function () {
      var vm = this;
      vm.new_filter_field = '';
      vm.new_filter_op = '';
      vm.new_filter_value = '';
      vm.new_filter_exposed_setting = false;
      vm.new_filter_exposed_lable = '';
      vm.new_filter_exposed_description = '';
      vm.new_filter_exposed_identifier = '';
      vm.edit_filter_mode = false;
    },
    removeFilter: function (filter) {
      var vm = this;
      vm.view_filters.splice(vm.view_filters.indexOf(filter), 1);
    },
    addNewSort: function(exposed) {
      var vm = this;
      if(!exposed){
        if (vm.new_sort_field == '' || vm.new_sort_value == '') {
          layer.alert('Please select the sort field！', {icon: 5});
          return;
        }
      }else {
        vm.has_exposed_sort = true;
      }

      vm.view_sorts.push({
        field: vm.new_sort_field,
        value: vm.new_sort_value,
        date: vm.select_field_sort_type ? vm.new_sort_date : '',
        exposed: exposed ? exposed : false,
        exposed_setting: {
          lable: vm.new_sort_exposed_lable
        }
      });
      vm.new_sort_exposed_setting = false;
    },
    editSort: function (sort) {
      var vm = this;
      vm.new_sort_field = sort.field;
      vm.new_sort_value = sort.value;
      vm.new_sort_date = sort.date;
      vm.new_sort_exposed_setting = sort.exposed;
      vm.new_sort_exposed_lable = sort.exposed_setting.lable;
      vm.editedSort = sort;
      vm.edit_sort_mode = true;
    },
    doneEditSort: function (exposed) {
      var vm = this;
      vm.view_sorts.splice(vm.view_sorts.indexOf(vm.editedSort), 1, {
        field: vm.new_sort_field,
        value: vm.new_sort_value,
        date: vm.select_field_sort_type ? vm.new_sort_date : '',
        exposed: exposed ? exposed : false,
        exposed_setting: {
          lable: vm.new_sort_exposed_lable
        }
      });
      vm.edit_sort_mode = false;
      vm.new_sort_exposed_setting = false;
    },
    cancelEditSort: function () {
      var vm = this;
      vm.new_sort_field = '';
      vm.new_sort_value = '';
      vm.new_sort_date = '';
      vm.new_sort_exposed_setting = false;
      vm.new_sort_exposed_lable = '';
      vm.edit_sort_mode = false;
    },
    removeSort: function (sort) {
      var vm = this;
      vm.view_sorts.splice(vm.view_sorts.indexOf(sort), 1);
    },

    addNewRelation: function() {
      var vm = this;
      vm.view_relations.push({
        view_table_field: vm.new_view_table_field,
        view_relation_table: vm.new_view_relation_table,
        view_relation_table_field: vm.new_view_relation_table_field
      });

      //添加已选表在关联黑名单, 因为不能自己关联自己
      vm.black_relation_tables.push(vm.new_view_relation_table);
      vm.addRelationshipFields();
    },
    editRelation: function (relation) {
      var vm = this;
      vm.new_view_table_field = relation.view_table_field;
      vm.new_view_relation_table = relation.view_relation_table;
      vm.new_view_relation_table_field = relation.view_relation_table_field;
      vm.editedRelation = relation;
      vm.edit_relation_mode = true;
    },
    doneEditRelation: function () {
      var vm = this;
      vm.view_relations.splice(vm.view_relations.indexOf(vm.editedRelation), 1, {
        view_table_field: vm.new_view_table_field,
        view_relation_table: vm.new_view_relation_table,
        view_relation_table_field: vm.new_view_relation_table_field
      });
    },
    cancelEditRelation: function () {
      var vm = this;
      vm.new_view_table_field = '';
      vm.new_view_relation_table = '';
      vm.new_view_relation_table_field = '';
    },
    removeRelation: function (relation) {
      var vm = this;
      vm.view_relations.splice(vm.view_relations.indexOf(relation), 1);
      vm.removeRelationshipFields(relation);
    },
    previewResult: function() {
      var vm = this;
      vm.saveView('temp');
    },
    getPreviewResult: function() {
      var vm = this;
      vm.$http.post('/admin/api/query-result', {
        'view_machine_name': vm.view_machine_name,
        'context_filter_value': vm.context_filter_value
      }).then(function (response) {
        if (response.body.length == false) {
          layer.alert('preview error！', {icon: 5});
        } else {
          vm.preview_result = response.body;
        }
      }, function (response) {
        layer.alert('preview error！', {icon: 5});
      });
    },
    saveView: function(type) {
      var vm = this;
      if(vm.need_permission){
        vm.view_permissions = $(".dropdown-permission-list select").val();
      }
      vm.$http.post('/admin/api/save-view', {
        'view_name': vm.view_name,
        'view_machine_name': vm.view_machine_name,
        'view_title': vm.view_title,
        'view_description': vm.view_description,
        'view_table': vm.view_table,
        'view_fields': vm.view_fields,
        'view_filters': vm.view_filters,
        'view_sorts': vm.view_sorts,
        'view_relations': vm.view_relations,
        'has_pager': vm.has_pager,
        'has_exposed_sort': vm.has_exposed_sort,
        'view_pager': vm.view_pager,
        'template_content': vm.template_content,
        'type': type,
        'json_export': vm.json_export,
        'view_path': vm.view_path,
        'view_permissions': vm.view_permissions
      }).then(function (response) {
          if (response.body.length == false) {
            layer.alert('init error！', {icon: 5});
          } else {
            if(response.body == true) {
              window.location.href = "/admin/views";
            }else {
              vm.temp_template = response.body;
              vm.getPreviewResult();
            }
          }
      }, function (response) {
          layer.alert('init error！', {icon: 5});
      });
  	},
    updateField: function() {
      var vm = this;
      vm.fields = {};
      for(var n in vm.tables[vm.view_table].fields){
        vm.fields[vm.view_table+'.'+n] = vm.tables[vm.view_table].fields[n];
      }

      //添加已选表在关联黑名单, 因为不能自己关联自己
      vm.black_relation_tables.push(vm.view_table);
    },
    updateFilterOp: function() {
      var vm = this;
      var select_table = vm.new_filter_field.split(".")[0];
      var select_filed = vm.new_filter_field.split(".")[1];
      vm.select_field_filter_type = vm.tables[select_table].fields[select_filed].filter_type;
      vm.filter_ops = vm.filters_list[vm.select_field_filter_type];
      vm.new_filter_exposed_lable = vm.fields[vm.new_filter_field].name;
      vm.new_filter_exposed_identifier = vm.new_filter_field.replace(".","_");
      if(vm.select_field_filter_type == 'select') {
        vm.filter_value_options = vm.tables[select_table].fields[select_filed].filter_value_options;
      }
    },
    updateFilterSelectValue: function() {
      var vm = this;
      if(vm.select_field_filter_value.indexOf('all') < 0) {
        vm.new_filter_value = vm.select_field_filter_value.join("|");
      }else {
        var arr = []
        for (let i in vm.filter_value_options) {
            arr.push(vm.filter_value_options[i]);
        }
        vm.new_filter_value = arr.join("|");
      }

    },
    updateSortType: function() {
      var vm = this;
      var select_table = vm.new_sort_field.split(".")[0];
      var select_filed = vm.new_sort_field.split(".")[1];
      if(vm.tables[select_table].fields[select_filed].sort_type){
        vm.select_field_sort_type = vm.tables[select_table].fields[select_filed].sort_type;
      }else {
        vm.select_field_sort_type = '';
      }
      vm.new_sort_exposed_lable = vm.fields[vm.new_sort_field].name;
    },
    addRelationshipFields: function() {
      var vm = this;
      for(var n in vm.tables[vm.new_view_relation_table].fields){
        vm.fields[vm.new_view_relation_table+'.'+n] = vm.tables[vm.new_view_relation_table].fields[n];
      }
      vm.new_view_table_field = '';
      vm.new_view_relation_table = '';
      vm.new_view_relation_table_field = '';
  	},
    removeRelationshipFields: function(relation) {
      var vm = this;
      for(var n in vm.tables[relation.view_relation_table].fields){
        delete vm.fields[relation.view_relation_table+'.'+n];
        if(vm.view_fields.indexOf(relation.view_relation_table+'.'+n) > 0) {
          vm.view_fields.splice(vm.view_fields.indexOf(relation.view_relation_table+'.'+n), 1);
        }
      }
    },
    scanPermission: function() {
      var vm = this;
      if(vm.need_permission){
        vm.$http.post('/admin/api/permissions').then(function (response) {
          if (response.body.length != 0) {
            vm.permissions = response.body;
            $('.dropdown-permission-list').dropdown({
              data: response.body,
              searchable: false,
            });
          }
        }, function (response) {
          layer.alert('init error！', {icon: 5});
        });
      }
  	},
    setTextarea: function(type) {
      var vm = this;
      var htmltext = '';
      var topformtext = '';
      var filtertext = '';
      var sorttext = '';

      if(vm.view_filters.length != 0){
        for (var k = 0, length = vm.view_filters.length; k < length; k++) {
          if(vm.view_filters[k].exposed){
            filtertext += '  <div class="form-group">\n';
            filtertext += '   <label class="form-label">'+vm.view_filters[k].exposed_setting.lable+'：</label>\n';
            filtertext += '   <input type="text" name="'+vm.view_filters[k].exposed_setting.identifier+'" class="filter-input" value="{{ isset($parms[\''+vm.view_filters[k].exposed_setting.identifier+'\']) ? $parms[\''+vm.view_filters[k].exposed_setting.identifier+'\'] : "" }}">'+vm.view_filters[k].exposed_setting.description+'\n';
            filtertext += '  </div>\n';
          }
        }
      }

      if(vm.has_exposed_sort){
        sorttext += '  <div class="form-group">\n';
        sorttext += '   <label class="form-label">{{ t("Sort By") }}：</label>\n';
        sorttext += '   <select name="sort_by" class="form-control">\n';
        for (var k = 0, length = vm.view_sorts.length; k < length; k++) {
          if(vm.view_sorts[k].exposed){
            var field_name = vm.view_sorts[k].field.substr(vm.view_sorts[k].field.indexOf(".")+1);
            sorttext += '   <option value="'+field_name+'" {{ isset($parms[\'sort_by\']) && $parms[\'sort_by\'] == \''+field_name+'\' ? "selected" : "" }}>'+vm.view_sorts[k].exposed_setting.lable+'</option>\n';
          }
        }
        sorttext += '   </select>\n';
        sorttext += '  </div>\n';
        sorttext += '  <div class="form-group">\n';
        sorttext += '   <label class="form-label">{{ t("Order") }}：</label>\n';
        sorttext += '   <select name="sort_order" class="form-control">\n';
        sorttext += '    <option value="ASC" {{ isset($parms[\'sort_order\']) && strtolower($parms[\'sort_order\']) == \'asc\' ? "selected" : "" }}>Asc</option>\n';
        sorttext += '    <option value="DESC" {{ isset($parms[\'sort_order\']) && strtolower($parms[\'sort_order\']) == \'desc\' ? "selected" : "" }}>Desc</option>\n';
        sorttext += '   </select>\n';
        sorttext += '  </div>\n';
      }

      if(filtertext != '' || sorttext != ''){
        topformtext += '<div class="views_expose_form">\n <form action="'+vm.view_path+'">\n';
        topformtext += filtertext;
        topformtext += sorttext;
        topformtext += '  <button type="submit" class="btn btn-primary">{{ t("Filter") }}</button>';
        topformtext += ' </form>\n</div>\n';
      }

      switch(type)
      {
      case 'htmllist':
        htmltext += topformtext;
        htmltext += '<div class="item-list">\n <ul>\n';
        htmltext += '  @foreach($viewdata as $item)\n  <li>\n';
        if(vm.view_fields != []){
          for (var i=0; i<vm.view_fields.length; i++){
            htmltext += '   <p>{{ $item->'+vm.view_fields[i].split(".")[1]+' }}</p>\n';
          }
        }
        htmltext += '  </li>\n  @endforeach\n';
        htmltext += ' </ul>\n</div>\n';
        break;
      case 'table':
        htmltext += topformtext;
        htmltext += '<table class="table">\n <thead>\n  <tr>\n';
        if(vm.view_fields != []){
          for (var i=0; i<vm.view_fields.length; i++){
            htmltext += '   <th>'+vm.fields[vm.view_fields[i]].name+'</th>\n';
          }
        }
        htmltext += '  </tr>\n </thead>\n <tbody>\n';
        htmltext += '  @foreach($viewdata as $item)\n  <tr>\n';
        if(vm.view_fields != []){
          for (var i=0; i<vm.view_fields.length; i++){
            htmltext += '   <td>{{ $item->'+vm.view_fields[i].split(".")[1]+' }}</td>\n';
          }
        }
        htmltext += '  </tr>\n  @endforeach\n';
        htmltext += ' </tbody>\n</table>\n';
        break;
      case 'html5':
        htmltext += '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
        htmltext += '  <meta charset="UTF-8">\n  <title>';
        htmltext += vm.view_title ? vm.view_title : vm.view_name;
        htmltext += '</title>\n</head>\n<body>\n';
        htmltext += topformtext;
        if(vm.view_fields != []){
          htmltext += '  @foreach($viewdata as $item)\n';
          for (var i=0; i<vm.view_fields.length; i++){
            htmltext += '   {{ $item->'+vm.view_fields[i].split(".")[1]+' }}\n';
          }
          htmltext += '  @endforeach\n';
        }
        break;
      default:
        if(vm.view_fields != []){
          htmltext += topformtext;
          htmltext += '@foreach($viewdata as $item)\n';
          for (var i=0; i<vm.view_fields.length; i++){
            htmltext += '{{ $item->'+vm.view_fields[i].split(".")[1]+' }}\n';
          }
          htmltext += '@endforeach\n\n';
        }
      }
      if(vm.has_pager && (vm.view_pager.type == 'mini' || vm.view_pager.type == 'full')){
        htmltext += '{!! hunter_pager($pager) !!}\n';
      }
      if(type == 'html5'){
        htmltext += '</body>\n</html>\n';
      }
      vm.template_content = htmltext;
    },
    setCookie: function (name,value) {
        var exp = new Date();
        exp.setTime(exp.getTime() + 1*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    },
    getCookie: function (name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)) return unescape(arr[2]);
        else return null;
    },
  }
})
