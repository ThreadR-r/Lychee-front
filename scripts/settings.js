/**
 * @description Lets you change settings.
 */

settings = {};

settings.open = function() {
	if(lychee.api_V2)
	{
		// we may do something else here later
		view.settings.init()
	}
	else
	{
		view.settings.init()
	}
};

settings.createConfig = function() {

	const action = function(data) {

		let dbName        = data.dbName        || '';
		let dbUser        = data.dbUser        || '';
		let dbPassword    = data.dbPassword    || '';
		let dbHost        = data.dbHost        || '';
		let dbTablePrefix = data.dbTablePrefix || '';

		if (dbUser.length<1) {
			basicModal.error('dbUser');
			return false
		}

		if (dbHost.length<1) dbHost = 'localhost';
		if (dbName.length<1) dbName = 'lychee';

		let params = {
			dbName,
			dbUser,
			dbPassword,
			dbHost,
			dbTablePrefix
		};

		api.post('Config::create', params, function(data) {

			if (data!==true) {

				// Connection failed
				if (data==='Warning: Connection failed!') {

					basicModal.show({
						body: '<p>' + lychee.locale['ERROR_DB_1'] + '</p>',
						buttons: {
							action: {
								title: lychee.locale['RETRY'],
								fn: settings.createConfig
							}
						}
					});

					return false

				}

				// Creation failed
				if (data==='Warning: Creation failed!') {

					basicModal.show({
						body: '<p>' + lychee.locale['ERROR_DB_2'] + '</p>',
						buttons: {
							action: {
								title: lychee.locale['RETRY'],
								fn: settings.createConfig
							}
						}
					});

					return false

				}

				// Could not create file
				if (data==='Warning: Could not create file!') {

					basicModal.show({
						body: "<p>" + lychee.locale['ERROR_CONFIG_FILE'] + "</p>",
						buttons: {
							action: {
								title: lychee.locale['RETRY'],
								fn: settings.createConfig
							}
						}
					});

					return false

				}

				// Something went wrong
				basicModal.show({
					body: '<p>' + lychee.locale['ERROR_UNKNOWN'] + '</p>',
					buttons: {
						action: {
							title: lychee.locale['RETRY'],
							fn: settings.createConfig
						}
					}
				});

				return false

			} else {

				// Configuration successful
				window.location.reload()

			}

		})

	};

	let msg = `
			  <p>
				  ` + lychee.locale['DB_INFO_TITLE'] + `
				  <input name='dbHost' class='text' type='text' placeholder='` + lychee.locale['DB_INFO_HOST']+ `' value=''>
				  <input name='dbUser' class='text' type='text' placeholder='` + lychee.locale['DB_INFO_USER'] + `' value=''>
				  <input name='dbPassword' class='text' type='password' placeholder='` + lychee.locale['DB_INFO_PASSWORD'] + `' value=''>
			  </p>
			  <p>
				  ` + lychee.locale['DB_INFO_TEXT'] + `
				  <input name='dbName' class='text' type='text' placeholder='` + lychee.locale['DB_NAME'] + `' value=''>
				  <input name='dbTablePrefix' class='text' type='text' placeholder='` + lychee.locale['DB_PREFIX'] + `' value=''>
			  </p>
			  `;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['DB_CONNECT'],
				fn: action
			}
		}
	})

};

settings.createLogin = function() {

	const action = function(data) {

		let username = data.username;
		let password = data.password;

		if (username.length<1) {
			basicModal.error('username');
			return false
		}

		if (password.length<1) {
			basicModal.error('password');
			return false
		}

		basicModal.close();

		let params = {
			username,
			password
		};

		api.post('Settings::setLogin', params, function(data) {

			if (data!==true) {

				basicModal.show({
					body: '<p>' + lychee.locale['ERROR_LOGIN'] + '</p>',
					buttons: {
						action: {
							title: lychee.locale['RETRY'],
							fn: settings.createLogin
						}
					}
				})

			}

		})

	};

	let msg = `
			  <p>
				  ` + lychee.locale['LOGIN_TITLE'] + `
				  <input name='username' class='text' type='text' placeholder='` + lychee.locale['LOGIN_USERNAME'] + `' value=''>
				  <input name='password' class='text' type='password' placeholder='` + lychee.locale['LOGIN_PASSWORD'] + `' value=''>
			  </p>
			  `;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['LOGIN_CREATE'],
				fn: action
			}
		}
	})

};


// from https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
settings.getValues = function(form_name) {

	let values  = {};
	let inputs_select  = $(form_name + ' input[name], '+ form_name + ' select[name]');

	// Get value from all inputs
	$(inputs_select).each(function() {

		let name  = $(this).attr('name');
		// Store name and value of input
		values[name] = $(this).val()

	});
	return (Object.keys(values).length===0 ? null : values)

};

// from https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
settings.bind = function(item, name, fn) {

	// if ($(item).length)
	// {
	//     console.log('found');
	// }
	// else
	// {
	//     console.log('not found: ' + item);
	// }
	// Action-button
	$(item).on('click', function () {
		fn(settings.getValues(name))
	})
};

settings.changeLogin = function(params) {

		if (params.username.length < 1) {
			loadingBar.show('error', 'new username cannot be empty.');
			$('input[name=username]').addClass('error');
			return false
		}
		else
		{
			$('input[name=username]').removeClass('error');
		}

		if (params.password.length < 1) {
			loadingBar.show('error', 'new password cannot be empty.');
			$('input[name=password]').addClass('error');
			return false
		}
		else
		{
			$('input[name=password]').removeClass('error');
		}


		api.post('Settings::setLogin', params, function(data) {

			if (data!==true)
			{
				loadingBar.show('error', data.description);
				lychee.error(null, datas, data)
			}
			else {
				$('input[name]').removeClass('error');
				loadingBar.show('success', lychee.locale['SETTINGS_SUCCESS_LOGIN']);
				view.settings.content.clearLogin();
			}
		})

};

settings.changeSorting = function(params) {

	api.post('Settings::setSorting', params, function(data) {

		if (data===true) {
			lychee.sortingAlbums = 'ORDER BY ' + params['typeAlbums'] + ' ' + params['orderAlbums'];
			lychee.sortingPhotos = 'ORDER BY ' + params['typePhotos'] + ' ' + params['orderPhotos'];
			albums.refresh();
			loadingBar.show('success', lychee.locale['SETTINGS_SUCCESS_SORT']);
		} else lychee.error(null, params, data)

	})

};

settings.changeDropboxKey = function(params) {
	// let key = params.key;

	if (params.key.length<1) {
		loadingBar.show('error', 'key cannot be empty.');
		return false
	}

	api.post('Settings::setDropboxKey', params, function(data) {

		if (data===true) {
			lychee.dropboxKey = params.key;
			// if (callback) lychee.loadDropbox(callback)
			loadingBar.show('success', lychee.locale['SETTINGS_SUCCESS_DROPBOX']);
		} else lychee.error(null, params, data)

	})

};



settings.changeLang = function(params) {

	api.post('Settings::setLang', params, function(data) {

		if (data===true) {
			loadingBar.show('success', lychee.locale['SETTINGS_SUCCESS_LANG']);
			lychee.init();
		} else lychee.error(null, params, data)

	})

};

settings.changeLayout = function () {
	let params = {};
	if ( $('#JustifiedLayout:checked').length === 1 )
	{
		params.justified_layout = '1';
	}
	else
	{
		params.justified_layout = '0';
	}
	api.post('Settings::setLayoutOverlay', params, function (data) {
		if (data===true) {
			loadingBar.show('success', lychee.locale['SETTINGS_SUCCESS_LAYOUT']);
			lychee.justified = (params.justified_layout === '1');
		} else lychee.error(null, params, data)

	})
};

settings.changeImageOverlay = function () {
	let params = {};
	if ( $('#ImageOverlay:checked').length === 1 )
	{
		params.image_overlay = '1';
	}
	else
	{
		params.image_overlay = '0';
	}
	api.post('Settings::setImageOverlay', params, function (data) {
		if (data===true) {
			loadingBar.show('success', lychee.locale['SETTINGS_SUCCESS_IMAGE_OVERLAY']);
			lychee.image_overlay = (params.image_overlay === '1');
		} else lychee.error(null, params, data)

	})
};