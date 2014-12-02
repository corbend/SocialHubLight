$(function() {

	var nameField = $("input[name=name]");
	var usernameField = $("input[name=username]");
	var passwordField = $("input[name=password]");

	$('.submit-button').click(function() {
		$('form').submit({
			name: nameField.val(),
			username: usernameField.val(),
			passwordField: passwordField.val()
		})
	})
})