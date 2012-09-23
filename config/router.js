const CONTROLLER_PATH = __dirname + "/../app/controllers";
const SERVICE_PATH = __dirname + "/../app/services";

// Load in Services
var Landlord = require(SERVICE_PATH + "/landlord_service");

// Load in Controllers
var ChatController = require(CONTROLLER_PATH + "/chat_controller");

module.exports = function Router(Server) {

	Server.get("/", ChatController.index);

}
