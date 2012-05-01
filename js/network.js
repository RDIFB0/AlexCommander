/**
 * Created with JetBrains WebStorm.
 * User: RDIFB0
 * Date: 30.04.12
 * Time: 22:19
 * To change this template use File | Settings | File Templates.
 */

var Network = {
	//loaded: false,
	getFiles: function (directory, limit, offset) {
		var result = [];
		$.ajax({
			type: "POST",
			crossDomain: true,
			url: "http://kino2.dev/admin/options/fm",
			async: false,
			data: {
				'method': "filelist",
				'param1': directory,
				'limit': limit,
				'offset': offset
			},
			success: function(data) {
				if (typeof(data) == "string") {
					data = $.parseJSON(data);
				}
				if (data.files !== undefined) {
					result = data.files;
				} else{
					result = [];
				}
			},
			error: function() {
				result = [];
			}
		});
		return result;
	},

	copyFile: function (src, dest) {
		var result = false;
		$.ajax({
			type: "POST",
			crossDomain: true,
			url: "http://kino2.dev/admin/options/fm",
			async: false,
			data: {
				'method': "copy",
				'param1': src,
				'param2': dest
			},
			success: function(data) {
				if (typeof(data) == "string") {
					data = $.parseJSON(data);
				}
				result = data.success;
			},
			error: function() {
				result = false;
			}
		});
		return result;
	},

	renameFile: function (src, dest) {

	},

	deleteFile: function (src) {
		var result = false;
		$.ajax({
			type: "POST",
			crossDomain: true,
			url: "http://kino2.dev/admin/options/fm",
			async: false,
			data: {
				'method': "rm",
				'param1': src
			},
			success: function(data) {
				if (typeof(data) == "string") {
					data = $.parseJSON(data);
				}
				result = data.success;
			},
			error: function() {
				result = false;
			}
		});
		return result;
	}


};
