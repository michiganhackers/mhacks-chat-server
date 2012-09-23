(function(Tenant) {

	var wsHandle	= new WebSocket("ws://"+location.hostname+":1025");
	var msgQueue	= [];
	var handlers	= {};
	var data			= {};

	Tenant.sendChat = function sendChat(msg) {
		if(!wsHandle.readyState) { return msgQueue.push(msg); }
		wsHandle.send(JSON.stringify({route: msg.cmd, payload: msg.text}));
	}

	wsHandle.onopen = function(e) {
		var msg = null; while(msg = msgQueue.shift()) { Tenant.sendChat(msg); }
		wsHandle.send(JSON.stringify({route:"joinRoom",payload:"mh"}));
	}

	wsHandle.onmessage = function(e) {
		try {
			msg = JSON.parse(e.data);
			handlers[msg.route].call(this, msg.payload);
		} catch(err) {
			console.log(err, e.data);
			console.log(err.stack);
		}
	}

	handlers["ackJoinRoom"] = function(rid) {
		data.rid = rid;
		if(msgQueue.length) { wsHandle.onopen(); }
	}

	handlers["sys-message"] = 
	handlers["chat"] = 
	function msgFromServer(msg) { Chat.addMessage(msg); }

})(window.Tenant=(window.Tenant||{}));
