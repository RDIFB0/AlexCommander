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
		var result = null;
		$.ajax({
			type: "POST",
			crossDomain: true,
			url: "http://kino2.dev/admin/options/fm",
			async: false,
			data: {
				'method': "filelist",
				'dir': directory,
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
				//Network.loaded = true;
			},
			error: function() {
				result = [];
				//Network.loaded = true;
			}
		});
		//Network.loaded = false;
		return result;
	},

	renameFile: function () {

	},

	deleteFile: function () {

	}


};
