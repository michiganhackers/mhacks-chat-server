// Requires and Configs
////////////////////////////////////////////////////////////////////////////////
var WebSocket				= require("ws")
	, Tenant					= require("./tenant")
	, Util						= require("util")
	, EventEmitter		= require("events").EventEmitter
	, WebSocketServer	= WebSocket.Server
;

// External API
////////////////////////////////////////////////////////////////////////////////
module.exports.createLandlord = function createLandlord(opts) {
	return new Landlord(opts);
}

// Landlord Definition
////////////////////////////////////////////////////////////////////////////////
var Landlord = function(opts) {

	var self						= this;
	self.opts						= opts||{host:"0.0.0.0",port: 2048};
	self.roomsMap				= {};
	self.connectionsMap	= {};
	self.serverHandle		= new WebSocketServer(self.opts);

	self.serverHandle.on("connection", function(ws) {
		var newTenant = Tenant.createTenant(ws, self);
	});

	self.on("openTenant", function(tenant) {
		self.connectionsMap[tenant.id] = tenant;
	});

	self.on("closeTenant", function(tenant) {
		self.emit("leaveRoom", tenant, tenant.room); // Assume this is sync
		self.connectionsMap[tenant.id].destroy();
		delete self.connectionsMap[tenant.id];
	});

	self.on("joinRoom", function(tenant, rid) {
		if(!tenant.room) { 
			self.addTenantToRoom(tenant, rid); 
			tenant.send("ackJoinRoom", rid);
		}
	});

	self.on("leaveRoom", function(tenant, rid) {
		if(tenant.room) { self.removeTenantFromRoom(tenant, rid); }
	});

	self.on("sys-message", function(sourceT, msg) {
		if(!sourceT.room) { return; }
		var d = new Date();
		self.roomsMap[sourceT.room].forEach(function(t) {
			newMessage.call(t, "sys-message", msg, "System", new Date());
		});
	});

	self.on("message", function(sourceT, msg) {
		if(!sourceT.room) { return; }
		var d = new Date();
		self.roomsMap[sourceT.room].forEach(function(t) {
			newMessage.call(t, "chat", msg, (sourceT.get("nick")||sourceT.id), d);
		});
	});

	function newMessage(type, msg, user, date) {
		this.send(type, {message: msg, user: user, date: date});
	}
}

Util.inherits(Landlord, EventEmitter);

Landlord.prototype.addTenantToRoom =
function addTenantToRoom(tenant, rid) {
	tenant.room = rid;
	(this.roomsMap[rid]||(this.roomsMap[rid]=[])).push(tenant);
}

Landlord.prototype.removeTenantFromRoom =
function removeTenantFromRoom(tenant, rid) {
	var idx = this.roomsMap[rid].indexOf(tenant);
	this.roomsMap[rid].splice(idx, 1);
	tenant.room = null;
}
