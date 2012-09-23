// Requires and Configs
////////////////////////////////////////////////////////////////////////////////
var EventEmitter		= require("events").EventEmitter
	, Util						= require("util")
	, tenantIdCounter	= 0
;

// External API
////////////////////////////////////////////////////////////////////////////////
module.exports.createTenant = function createTenant(wsHandle, opts) {
	return new Tenant(wsHandle, opts);
}

// Tenant Helper Functions
////////////////////////////////////////////////////////////////////////////////
var messageReceiptHandler = 
function messageReceiptHandler(rawMsg) {
	try {
		var msg = JSON.parse(rawMsg);
		this.routes[msg.route].call(this, msg.payload);
	} catch(e) {
		console.log("Error handling message", e);
		console.log(e.stack);
	}
}

// Tenant Definition
////////////////////////////////////////////////////////////////////////////////
var Tenant = 
module.exports.Tenant =
function Tenant(wsHandle, landlord) {

	var self = this;

	self.wsHandle			= wsHandle;
	self.credentials	= null;
	self.id						= ++tenantIdCounter;
	self.data					= { room: null, nick: self.id };	
	self.landlord			= landlord;
	self.room					= null;

	// Tenant Initialization
	Tenant.prototype.generateCredentials.call(self);

	// Event Handler Registration
	self.wsHandle.on("message", messageReceiptHandler.bind(self));
	self.wsHandle.on("close", function() { landlord.emit("closeTenant", self); });
	self.wsHandle.on("error", function(e) { landlord.emit("errorTenant", self, e); });

	// Notify the landlord
	landlord.emit("openTenant", self);
}

Util.inherits(Tenant, EventEmitter);

Tenant.prototype.routes = {
	chat: function(payload) { 
		this.landlord.emit("message", this, payload);
	}
, joinRoom: function(rid) {
		this.landlord.emit("joinRoom", this, rid);
	}
, nick: function(nick) {
		var msg = this.get("nick") + " is now called " + nick;
		this.set("nick", nick);
		this.landlord.emit("sys-message", this, msg);
	}
};

Tenant.prototype.send = 
function send(route, payload) {
	this.wsHandle.send(JSON.stringify({route:route,payload:payload}));
}

Tenant.prototype.set = 
function set(key, val) {
	return this.data[key] = val;
}

Tenant.prototype.get = 
function get(key) {
	return this.data[key];
}

Tenant.prototype.destroy =
function destroy() {
	// Clean up all memory references
}

Tenant.prototype.generateCredentials = 
function generateCredentials() {
	this.credentials = "cred";
}

Tenant.prototype.revokeCredentials =
function revokeCredentials() {
	this.credentials = null;
}
