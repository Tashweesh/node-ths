/* A test script that runs a webserver on 127.0.0.1:2502
*  And creates a small CLI that lets you execute ths commands
*/

var readline = require('readline');
var http = require('http');
var thsBuilder = require('./index');
var ths = thsBuilder();

var server = http.createServer(function (req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello world!');
});
server.listen(2502, '127.0.0.1');
console.log('Server running at http://127.0.0.1:2502');

var rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.setPrompt('ths> ');
rl.prompt();
rl.on('line', function(line){
	line = line.trim();
	line = line.split(' ');
	switch (line[0]){
		case 'start':
			var startCallback = function(){
				console.log('Tor has been started');
			}
			if (line.length > 1 && line[1] == 'force'){
				ths.start(true, startCallback);
			} else ths.start(false, startCallback);
			break;
		case 'stop':
			var stopCallback = function(){
				console.log('Tor has been stopped');
			};
			ths.stop(stopCallback);
			break;
		case 'status':
			console.log('Is tor running : ' + (ths.isTorRunning() ? 'Yes' : 'No'));
			break;
		case 'list':
			var serviceList = ths.getServices();
			for (var i = 0; i < serviceList.length; i++){
				console.log('Service ' + (i + 1).toString() + ':' + serviceList[i].name);
				for (var j = 0; j < serviceList[i].ports.length; j++){
					console.log(serviceList[i].ports[j]);
				}
				console.log('');
			}
			break;
		case 'add':
			//syntax : add service-name onePort target1 [port2 target2,...]
			if (line.length > 3){
				var serviceName = line[1];
				var ports = [];
				var actualPort;
				for (var i = 1; i < (line.length - 1) / 2; i++){
					actualPort = line[2*i] + ' ' + line[2*i + 1];
					ports.push(actualPort);
				}
				ths.createHiddenService(serviceName, ports, true);
			} else {
				console.log('Invalid command. Syntax : add service-name onePort traget1 [otherPort otherTarget, ...]');
			}
			break;
		case 'delete':
			//syntax : delete service-name
			if (line.length == 2){
				var serviceName = line[1];
				ths.removeHiddenService(serviceName, true);
			} else {
				console.log('Invalid command. Syntax : delete service-name');
			}
			break;
		case 'addport':
			//syntax : addport service-name port1 target1 [port2 target2,...]
			if (line.length > 3){
				var serviceName = line[1];
				var ports = [];
				var actualPort;
				for (var i = 1; i < (line.length - 1) / 2; i++){
					actualPort = line[2*i] + ' ' + line[2*i + 1];
					ports.push(actualPort);
				}
				ths.addPorts(serviceName, ports, true);
			} else {
				console.log('Invalid command. Syntax : addport service-name port1 target1 [port2 target2]');
			}
			break;
		case 'removeport':
			//syntax : removeport service-name port1 target1 [port2 target2,...]
			if (line.length > 3){
				var serviceName = line[1];
				var ports = [];
				var actualPort;
				for (var i = 1; i < (line.length - 1) / 2; i++){
					actualPort = line[2*i] + ' ' + line[2*i + 1];
					ports.push(actualPort);
				}
				ths.removePorts(serviceName, ports, false, true);
			} else {
				console.log('Invalid command. Syntax : removeport service-name port1 [port2,...]');
			}
			break;
		case 'exit':
			process.exit(0);
			break;
		default:
			console.log('Unknown command: ' + line[0]);
			break;
	}
	rl.prompt();
}).on('close', function(){
	ths.stop();
	process.exit(0);
});