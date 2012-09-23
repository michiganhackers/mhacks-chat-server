$(document).ready(function() {

	$("#message-input-form").submit(function(e) {

		// Do not submit the form
		e.preventDefault();
		
		// Extract and post the message
		Chat.extractMessage(function(msg) { Tenant.sendChat(msg); });
	});

	// Define All of the Chat Functions
	(function(Chat) {

		var $chatLog = $("#chat-log");
		
		var msgTemplate = [
			'<blockquote>'
			, '<p class="message">{M}</p>'
			, '<small>'
				, '<span class="user">{U}</span>'
				, ' on '
				, '<span class="date">{D}</span>'
			, '</small>'
		, '</blockquote>'
		].join("");

		Chat.addMessage = function chatAddMessage(msg, cb) {
			var $newMsg = null;
			$chatLog.prepend($newMsg = $(msgTemplate
				.replace("{M}", msg.message)
				.replace("{U}", msg.user)
				.replace("{D}", msg.date)
			));

			if(typeof(cb) === "function") { return cb($newMsg); }
		}

		Chat.extractMessage = function chatExtractMessage(cb) {
			// Extract the val and clear the display
			var text	= $("#message-input").val()
				, match = text.match(/^\/([A-Za-z]+)\s+(.*)$/)
				, msg		= null 
			;

			if(match) { msg = {cmd: match[1], text: match[2]} } 
			else { msg = {cmd: "chat", text: text}; }

			$("#message-input").val("");
			if(typeof(cb) === "function") { return cb(msg); }
		}

	})(window.Chat=window.Chat||{});

});
